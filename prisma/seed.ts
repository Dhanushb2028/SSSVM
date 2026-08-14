import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Krishna", "Ishaan", "Rohan", "Karthik", "Arjun",
  "Ananya", "Diya", "Saanvi", "Meera", "Priya", "Sneha", "Kavya", "Lakshmi",
  "Rahul", "Sanjay", "Vikram", "Suresh", "Anjali", "Divya", "Pooja", "Nisha",
];
const LAST_NAMES = [
  "Reddy", "Rao", "Sharma", "Kumar", "Nair", "Iyer", "Menon", "Gupta",
  "Verma", "Naidu", "Chowdary", "Prasad", "Krishnan", "Pillai", "Das", "Shetty",
];

function nameFor(index: number) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return { firstName: first, lastName: last };
}

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding SSSVM demo data...");

  const organization = await db.organization.create({
    data: { name: "Sree Siva Shankar Vidya Mandir" },
  });

  const branch = await db.branch.create({
    data: {
      organizationId: organization.id,
      name: "K.R.M. Colony Main Campus",
      city: "K.R.M. Colony",
      address: "K.R.M. Colony",
      phone: "9000000000",
      isHostel: false,
    },
  });

  const academicYear = await db.academicYear.create({
    data: {
      branchId: branch.id,
      name: "2025-2026",
      startDate: new Date("2025-06-02"),
      endDate: new Date("2026-04-30"),
      isCurrent: true,
    },
  });

  const courseDefs = [
    { name: "Grade 5", orderIndex: 5 },
    { name: "Grade 6", orderIndex: 6 },
    { name: "Grade 7", orderIndex: 7 },
  ];
  const courses = [];
  for (const c of courseDefs) {
    courses.push(await db.course.create({ data: { organizationId: organization.id, ...c } }));
  }

  for (const subjectName of ["English", "Mathematics", "Science", "Social Studies", "Hindi"]) {
    await db.subject.create({ data: { organizationId: organization.id, name: subjectName } });
  }

  const sections = [];
  for (const course of courses) {
    sections.push(
      await db.section.create({
        data: { academicYearId: academicYear.id, branchId: branch.id, courseId: course.id, name: "A", capacity: 40 },
      }),
    );
  }

  // --- Staff / teachers ---
  const staffDefs = [
    { firstName: "Priya", lastName: "Reddy", designation: "Teacher - Mathematics", phone: "9000000001", code: "SSSVM-T001", username: "priya.reddy", classTeacherOf: sections[0] },
    { firstName: "Ravi", lastName: "Kumar", designation: "Teacher - Science", phone: "9000000002", code: "SSSVM-T002", username: "ravi.kumar", classTeacherOf: sections[1] },
    { firstName: "Lakshmi", lastName: "Nair", designation: "Teacher - English", phone: "9000000003", code: "SSSVM-T003", username: "lakshmi.nair", classTeacherOf: null },
  ];

  for (const s of staffDefs) {
    const staff = await db.staffMember.create({
      data: {
        branchId: branch.id,
        employeeCode: s.code,
        firstName: s.firstName,
        lastName: s.lastName,
        designation: s.designation,
        phone: s.phone,
      },
    });
    if (s.classTeacherOf) {
      await db.section.update({ where: { id: s.classTeacherOf.id }, data: { classTeacherId: staff.id } });
    }
    await db.user.create({
      data: {
        role: "TEACHER",
        username: s.username,
        passwordHash: await hash("Teacher@123"),
        staffMemberId: staff.id,
      },
    });
  }

  // --- Permission profiles ---
  const frontOffice = await db.permissionProfile.create({
    data: {
      name: "Front Office",
      grants: {
        create: [
          { module: "admissions.enquiries", action: "VIEW" },
          { module: "admissions.enquiries", action: "CREATE" },
          { module: "admissions.enquiries", action: "EDIT" },
          { module: "admissions.applications", action: "VIEW" },
          { module: "admissions.applications", action: "CREATE" },
          { module: "sis.students", action: "VIEW" },
          { module: "sis.id_cards", action: "VIEW" },
          { module: "sis.id_cards", action: "CREATE" },
          { module: "certificates.tc", action: "VIEW" },
          { module: "certificates.tc", action: "CREATE" },
        ],
      },
    },
  });

  await db.permissionProfile.create({
    data: {
      name: "Finance Staff",
      grants: {
        create: (["VIEW", "CREATE", "EDIT", "EXPORT"] as const).flatMap((action) => [
          { module: "finance.fee_structure", action },
          { module: "finance.transactions", action },
          { module: "finance.expenditure", action },
          { module: "finance.banking", action },
          { module: "finance.reports", action },
        ]),
      },
    },
  });

  // --- Admin users ---
  await db.user.create({
    data: {
      role: "ADMIN",
      username: "admin",
      name: "Suman Rao",
      email: "principal@sssvm.example",
      passwordHash: await hash("Admin@12345"),
    },
  });

  await db.user.create({
    data: {
      role: "ADMIN",
      username: "frontoffice",
      name: "Anitha Sharma",
      email: "frontoffice@sssvm.example",
      passwordHash: await hash("FrontOffice@123"),
      branchId: branch.id,
      permissionProfileId: frontOffice.id,
    },
  });

  // --- Students + guardians (8 per section, 24 total) ---
  let admissionCounter = 1;
  let guardianPhoneCounter = 100;
  let sharedGuardianId: string | null = null;

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    for (let i = 0; i < 8; i++) {
      const globalIndex = sectionIndex * 8 + i;
      const { firstName, lastName } = nameFor(globalIndex);
      const admissionNumber = `SSSVM2025-${String(admissionCounter).padStart(3, "0")}`;
      admissionCounter += 1;

      const isDemoStudentLogin = globalIndex === 2;
      const isSiblingA = globalIndex === 0;
      const isSiblingB = globalIndex === 8;

      const student = await db.student.create({
        data: {
          admissionNumber,
          branchId: branch.id,
          sectionId: section.id,
          firstName,
          lastName,
          dob: new Date(2015 - sectionIndex, i % 12, (i % 27) + 1),
          gender: globalIndex % 2 === 0 ? "MALE" : "FEMALE",
          contactPhone: isDemoStudentLogin ? "9222222222" : undefined,
          contactEmail: isDemoStudentLogin ? "student.demo@sssvm.example" : undefined,
        },
      });

      if (isDemoStudentLogin) {
        await db.user.create({
          data: {
            role: "STUDENT",
            mobile: "9222222222",
            passwordHash: await hash("Student@123"),
            studentId: student.id,
          },
        });
      }

      if (isSiblingA || isSiblingB) {
        if (!sharedGuardianId) {
          const guardian = await db.guardian.create({
            data: { firstName: "Suresh", lastName: "Kumar", phone: "9333333333", email: "parent.demo@sssvm.example" },
          });
          sharedGuardianId = guardian.id;
          await db.user.create({
            data: { role: "PARENT", mobile: "9333333333", passwordHash: await hash("Parent@123"), guardianId: guardian.id },
          });
        }
        await db.studentGuardian.create({
          data: { studentId: student.id, guardianId: sharedGuardianId, relationship: "FATHER", isPrimary: true },
        });
        continue;
      }

      guardianPhoneCounter += 1;
      const guardianNames = nameFor(globalIndex + 1);
      const guardian = await db.guardian.create({
        data: {
          firstName: guardianNames.firstName,
          lastName,
          phone: `90000${String(guardianPhoneCounter).padStart(5, "0")}`,
        },
      });
      await db.studentGuardian.create({
        data: { studentId: student.id, guardianId: guardian.id, relationship: "FATHER", isPrimary: true },
      });
    }
  }

  console.log("Seed complete.");
  console.log("");
  console.log("Demo logins:");
  console.log("  Admin (full access):     admin / Admin@12345");
  console.log("  Admin (Front Office):    frontoffice / FrontOffice@123");
  console.log("  Teacher:                 priya.reddy / Teacher@123");
  console.log("  Student (mobile login):  9222222222 / Student@123");
  console.log("  Parent (mobile login):   9333333333 / Parent@123  (2 linked children)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
