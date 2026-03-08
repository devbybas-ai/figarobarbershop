import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEV_PASSWORD = "figaro2026";

async function main() {
  console.log("Seeding Figaro Barbershop Leucadia...\n");

  const passwordHash = await hash(DEV_PASSWORD, 12);

  // === SHOP SETTINGS ===
  const shop = await prisma.shopSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      shopName: "Figaro Barbershop Leucadia",
      phone: "(760) 751-2008",
      email: "barbarospleucadia@gmail.com",
      address: "114 Leucadia Blvd",
      city: "Encinitas",
      state: "CA",
      zip: "92024",
      timezone: "America/Los_Angeles",
    },
  });
  console.log(`Shop settings: ${shop.shopName}`);

  // === USERS (with hashed passwords) ===
  const usersData = [
    { email: "owner@figaroleucadia.com", name: "Ricardo (Owner)", role: "OWNER" as const },
    { email: "zeke@figaroleucadia.com", name: "Zeke", role: "BARBER" as const },
    { email: "bryam@figaroleucadia.com", name: "Bryam", role: "BARBER" as const },
    { email: "johnny@figaroleucadia.com", name: "Johnny", role: "BARBER" as const },
    { email: "david@figaroleucadia.com", name: "David", role: "BARBER" as const },
    { email: "austin@figaroleucadia.com", name: "Austin", role: "BARBER" as const },
    { email: "front@figaroleucadia.com", name: "Front Desk", role: "RECEPTIONIST" as const },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { passwordHash },
      create: { ...userData, passwordHash },
    });
    users.push(user);
    console.log(`User: ${user.email} (${user.role})`);
  }

  // === BARBERS ===
  const barbersData = [
    {
      firstName: "Ricardo",
      lastName: "",
      phone: "(760) 751-2008",
      bio: "Master Barber and owner. The heart and soul of Figaro Barbershop Leucadia.",
      commissionRate: 50,
      userEmail: "owner@figaroleucadia.com",
    },
    {
      firstName: "Zeke",
      lastName: "",
      phone: "(760) 751-2008",
      bio: "Master Barber with years of experience. Expert in classic and modern styles.",
      commissionRate: 50,
      userEmail: "zeke@figaroleucadia.com",
    },
    {
      firstName: "Bryam",
      lastName: "",
      phone: "(760) 751-2008",
      bio: "Skilled barber known for precision fades and clean lines.",
      commissionRate: 45,
      userEmail: "bryam@figaroleucadia.com",
    },
    {
      firstName: "Johnny",
      lastName: "",
      phone: "(760) 751-2008",
      bio: "Brings energy and creativity to every cut. A client favorite.",
      commissionRate: 45,
      userEmail: "johnny@figaroleucadia.com",
    },
    {
      firstName: "David",
      lastName: "",
      phone: "(760) 751-2008",
      bio: "Specializes in textured cuts and beard work. Always delivers a polished look.",
      commissionRate: 45,
      userEmail: "david@figaroleucadia.com",
    },
    {
      firstName: "Austin",
      lastName: "",
      phone: "(760) 751-2008",
      bio: "Known for sharp fades and attention to detail. Always on point.",
      commissionRate: 40,
      userEmail: "austin@figaroleucadia.com",
    },
  ];

  // Clear existing barber schedules and barbers for clean re-seed
  await prisma.barberSchedule.deleteMany();
  await prisma.barber.deleteMany();

  const barbers = [];
  for (const data of barbersData) {
    const { userEmail, ...barberFields } = data;
    const linkedUser = users.find((u) => u.email === userEmail);
    const barber = await prisma.barber.create({
      data: {
        ...barberFields,
        isActive: true,
        ...(linkedUser ? { user: { connect: { id: linkedUser.id } } } : {}),
      },
    });
    barbers.push(barber);
    console.log(`Barber: ${barber.firstName} ${barber.lastName}`);
  }

  // === BARBER SCHEDULES (Mon=1 through Sun=7) ===
  const defaultSchedule = [
    { dayOfWeek: 1, startTime: "10:30", endTime: "18:30", isOff: false },
    { dayOfWeek: 2, startTime: "10:30", endTime: "18:30", isOff: false },
    { dayOfWeek: 3, startTime: "10:30", endTime: "18:30", isOff: false },
    { dayOfWeek: 4, startTime: "10:30", endTime: "18:30", isOff: false },
    { dayOfWeek: 5, startTime: "10:30", endTime: "18:30", isOff: false },
    { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isOff: false },
    { dayOfWeek: 7, startTime: "10:00", endTime: "16:00", isOff: false },
  ];

  for (const barber of barbers) {
    for (const schedule of defaultSchedule) {
      await prisma.barberSchedule.create({
        data: { barberId: barber.id, ...schedule },
      });
    }
  }
  console.log("Barber schedules created (7 days x 6 barbers)");

  // === SERVICES ===
  const servicesData = [
    {
      name: "Skin Fade",
      description:
        "Experience a modern, clean look with a precise blend from short to longer lengths. Sharp finish around the sides and back, creating a seamless transition for a fresh, stylish appearance.",
      category: "HAIRCUT" as const,
      durationMinutes: 50,
      price: 50,
    },
    {
      name: "Scissor Cuts",
      description:
        "A classic haircut designed for clean lines and a polished look. Precise shaping tailored to your style and preferences. Leaves you looking sharp and refreshed.",
      category: "HAIRCUT" as const,
      durationMinutes: 50,
      price: 50,
    },
    {
      name: "Buzz Cut",
      description:
        "A sharp, low-maintenance style. This classic, all-over short haircut offers a clean and modern look with minimal fuss. A polished finish in no time.",
      category: "HAIRCUT" as const,
      durationMinutes: 30,
      price: 30,
    },
    {
      name: "Women's Hair Cut Long",
      description:
        "A professional long haircut tailored to your style. Precise trimming that keeps your hair healthy, beautifully shaped, and easy to manage.",
      category: "HAIRCUT" as const,
      durationMinutes: 60,
      price: 80,
    },
    {
      name: "Beard Trim With Trimmers",
      description:
        "Achieve a clean, sharp look with a precise beard trim using trimmers. Defines your beard's shape and maintains a well-groomed appearance.",
      category: "BEARD" as const,
      durationMinutes: 30,
      price: 35,
    },
    {
      name: "Beard Trim With Shave",
      description:
        "A precise beard trim combined with a clean, classic shave. Shapes and defines your beard while providing a smooth finish for the rest of your face.",
      category: "BEARD" as const,
      durationMinutes: 45,
      price: 35,
    },
    {
      name: "Full Shave",
      description:
        "Achieve a smooth, clean look with a full shave customized just for you. Expert attention to detail as facial hair is gently removed, leaving your skin refreshed and revitalized.",
      category: "SHAVE" as const,
      durationMinutes: 50,
      price: 50,
    },
  ];

  await prisma.appointmentItem.deleteMany();
  await prisma.service.deleteMany();

  for (const service of servicesData) {
    const created = await prisma.service.create({
      data: { ...service, isActive: true },
    });
    console.log(`Service: ${created.name} ($${service.price})`);
  }

  // === PRODUCTS ===
  const productsData = [
    {
      name: "Figaro Pomade (Classic Hold)",
      description: "Medium hold, high shine pomade. Water-based for easy wash-out.",
      sku: "FIG-POM-001",
      price: 22,
      costPrice: 8,
      isForSale: true,
      quantity: 24,
      reorderLevel: 6,
    },
    {
      name: "Figaro Matte Clay",
      description: "Strong hold, matte finish styling clay. Perfect for textured looks.",
      sku: "FIG-CLY-001",
      price: 24,
      costPrice: 9,
      isForSale: true,
      quantity: 18,
      reorderLevel: 6,
    },
    {
      name: "Beard Oil - Sandalwood",
      description: "Premium beard oil with sandalwood and jojoba. Softens and conditions.",
      sku: "FIG-BOL-001",
      price: 18,
      costPrice: 6,
      isForSale: true,
      quantity: 15,
      reorderLevel: 5,
    },
    {
      name: "Aftershave Balm",
      description: "Soothing aftershave balm with aloe vera. Calms and moisturizes.",
      sku: "FIG-ASB-001",
      price: 16,
      costPrice: 5,
      isForSale: true,
      quantity: 20,
      reorderLevel: 5,
    },
    {
      name: "Neck Strips (Box)",
      description: "Professional neck strips. Box of 100.",
      sku: "FIG-NST-001",
      price: 8,
      costPrice: 3,
      isForSale: false,
      quantity: 10,
      reorderLevel: 3,
    },
  ];

  await prisma.inventoryItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();

  for (const { quantity, reorderLevel, ...productData } of productsData) {
    const product = await prisma.product.create({
      data: productData,
    });
    await prisma.inventoryItem.create({
      data: { productId: product.id, quantity, reorderLevel },
    });
    console.log(`Product: ${product.name} (stock: ${quantity})`);
  }

  // === SAMPLE CLIENTS ===
  const clientsData = [
    {
      firstName: "James",
      lastName: "Wilson",
      email: "james.w@example.com",
      phone: "(760) 555-0201",
    },
    {
      firstName: "Michael",
      lastName: "Chen",
      email: "m.chen@example.com",
      phone: "(760) 555-0202",
    },
    {
      firstName: "David",
      lastName: "Thompson",
      email: "d.thompson@example.com",
      phone: "(760) 555-0203",
    },
    {
      firstName: "Alex",
      lastName: "Martinez",
      email: "a.martinez@example.com",
      phone: "(760) 555-0204",
    },
    {
      firstName: "Ryan",
      lastName: "O'Brien",
      email: "r.obrien@example.com",
      phone: "(760) 555-0205",
    },
  ];

  for (const client of clientsData) {
    const created = await prisma.client.upsert({
      where: { email: client.email },
      update: {},
      create: client,
    });
    console.log(`Client: ${created.firstName} ${created.lastName}`);
  }

  console.log("\nSeed complete! Figaro Barbershop Leucadia is ready.");
  console.log(`\nDev login: any user email above + password "${DEV_PASSWORD}"`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
