/**
 * Demo/seed data for local development and manual API testing.
 * None of this represents a real firm, client, or government notice —
 * see docs/DEMO.md. Independent from web/src/lib/data/fixtures.ts (the
 * frontend's mock data module); the two are written separately but cover
 * the same illustrative scenario on purpose so a demo walkthrough is
 * consistent whether you're looking at the mock-data frontend or a
 * frontend wired up to this real, seeded database.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await bcrypt.hash('demo-password-123', 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'northbridge-demo' },
    update: {},
    create: {
      name: 'Northbridge Immigration Partners',
      slug: 'northbridge-demo',
      users: {
        create: [
          { email: 'priya@northbridge.demo', name: 'Priya Nathan', passwordHash, role: 'ADMIN' },
          { email: 'marcus@northbridge.demo', name: 'Marcus Webb', passwordHash, role: 'ATTORNEY' },
          { email: 'sofia@northbridge.demo', name: 'Sofia Lindqvist', passwordHash, role: 'PARALEGAL' },
          { email: 'daniel@clientco.demo', name: 'Daniel Osei', passwordHash, role: 'CLIENT' },
        ],
      },
    },
    include: { users: true },
  });
  const adminUser = tenant.users.find((u) => u.role === 'ADMIN')!;

  const countryDefs = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'AU', name: 'Australia' },
    { code: 'FR', name: 'France' },
  ];
  const countries = new Map<string, Awaited<ReturnType<typeof prisma.country.upsert>>>();
  for (const c of countryDefs) {
    const country = await prisma.country.upsert({ where: { code: c.code }, update: {}, create: c });
    countries.set(c.code, country);
  }

  const visaTypeDefs = [
    { countryCode: 'US', code: 'H-1B', label: 'Specialty Occupation Worker' },
    { countryCode: 'US', code: 'L-1', label: 'Intracompany Transferee' },
    { countryCode: 'GB', code: 'Skilled Worker', label: 'Skilled Worker Visa' },
    { countryCode: 'CA', code: 'Express Entry', label: 'Express Entry (FSW/CEC)' },
    { countryCode: 'DE', code: 'EU Blue Card', label: 'EU Blue Card' },
    { countryCode: 'AU', code: 'Subclass 482', label: 'Skills in Demand Visa' },
  ];
  const visaTypes = new Map<string, Awaited<ReturnType<typeof prisma.visaType.upsert>>>();
  for (const v of visaTypeDefs) {
    const country = countries.get(v.countryCode)!;
    const visaType = await prisma.visaType.upsert({
      where: { countryId_code: { countryId: country.id, code: v.code } },
      update: {},
      create: { countryId: country.id, code: v.code, label: v.label },
    });
    visaTypes.set(v.code, visaType);
  }

  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const updateDefs = [
    {
      externalId: 'seed-upd-001',
      title: 'USCIS raises H-1B registration fee for FY2028 cap season',
      summary: 'Sample notice: the registration fee for the H-1B electronic registration process increases ahead of the next cap season.',
      sourceUrl: 'https://www.federalregister.gov/',
      sourceName: 'Federal Register (sample)',
      countryCode: 'US',
      visaCode: 'H-1B',
      priority: 'HIGH' as const,
      publishedAt: daysAgo(2),
      tags: ['fee-change', 'cap-season'],
    },
    {
      externalId: 'seed-upd-002',
      title: 'UK Skilled Worker minimum salary threshold to be revised',
      summary: 'Sample notice: the Home Office signals an update to the general salary threshold for the Skilled Worker route.',
      sourceUrl: 'https://www.gov.uk/government/organisations/uk-visas-and-immigration',
      sourceName: 'UK Visas and Immigration (sample)',
      countryCode: 'GB',
      visaCode: 'Skilled Worker',
      priority: 'HIGH' as const,
      publishedAt: daysAgo(4),
      tags: ['salary-threshold'],
    },
    {
      externalId: 'seed-upd-003',
      title: 'IRCC opens new Express Entry category-based draw for tech occupations',
      summary: 'Sample notice: IRCC announces a category-based selection round targeting STEM and technology occupations.',
      sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship.html',
      sourceName: 'IRCC (sample)',
      countryCode: 'CA',
      visaCode: 'Express Entry',
      priority: 'MEDIUM' as const,
      publishedAt: daysAgo(6),
      tags: ['express-entry', 'draw'],
    },
    {
      externalId: 'seed-upd-004',
      title: 'Germany lowers EU Blue Card minimum salary threshold for shortage occupations',
      summary: 'Sample notice: the qualifying gross salary threshold for EU Blue Card applicants in shortage occupations is reduced.',
      sourceUrl: 'https://www.make-it-in-germany.com/',
      sourceName: 'Make it in Germany (sample)',
      countryCode: 'DE',
      visaCode: 'EU Blue Card',
      priority: 'MEDIUM' as const,
      publishedAt: daysAgo(9),
      tags: ['blue-card', 'salary-threshold'],
    },
    {
      externalId: 'seed-upd-005',
      title: 'USCIS extends automatic EAD extension period for certain renewal applicants',
      summary: 'Sample notice: automatic extension coverage for pending EAD renewals is lengthened to offset processing backlogs.',
      sourceUrl: 'https://www.federalregister.gov/',
      sourceName: 'Federal Register (sample)',
      countryCode: 'US',
      visaCode: 'H-1B',
      priority: 'CRITICAL' as const,
      publishedAt: daysAgo(1),
      tags: ['EAD', 'work-authorization'],
    },
    {
      externalId: 'seed-upd-006',
      title: 'Australia raises Temporary Skilled Migration Income Threshold',
      summary: 'Sample notice: annual indexation of TSMIT increases, affecting minimum salary requirements for new Subclass 482 nominations.',
      sourceUrl: 'https://immi.homeaffairs.gov.au/',
      sourceName: 'Department of Home Affairs (sample)',
      countryCode: 'AU',
      visaCode: 'Subclass 482',
      priority: 'HIGH' as const,
      publishedAt: daysAgo(5),
      tags: ['tsmit', 'salary-threshold'],
    },
  ];

  const createdUpdates: Awaited<ReturnType<typeof prisma.immigrationUpdate.upsert>>[] = [];
  for (const u of updateDefs) {
    const country = countries.get(u.countryCode)!;
    const visaType = visaTypes.get(u.visaCode);
    const record = await prisma.immigrationUpdate.upsert({
      where: { externalId: u.externalId },
      update: {},
      create: {
        externalId: u.externalId,
        tenantId: tenant.id,
        title: u.title,
        summary: u.summary,
        sourceUrl: u.sourceUrl,
        sourceName: u.sourceName,
        countryId: country.id,
        visaTypeId: visaType?.id,
        priority: u.priority,
        publishedAt: u.publishedAt,
        tags: u.tags,
      },
    });
    createdUpdates.push(record);
  }

  await prisma.alert.createMany({
    data: createdUpdates.slice(0, 3).map((update) => ({
      tenantId: tenant.id,
      updateId: update.id,
      userId: adminUser.id,
      status: 'UNREAD' as const,
    })),
    skipDuplicates: true,
  });

  console.log('Seed complete.');
  console.log('Demo logins (password: demo-password-123):');
  for (const u of tenant.users) console.log(`  ${u.email} (${u.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
