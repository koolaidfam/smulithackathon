/**
 * The people directory the connector would build.
 *
 * A document library already knows who can open what. That is the cheapest
 * honest way to seed the firm's people and their teams: no HR export, no
 * manual mapping, just the access lists the library already keeps.
 *
 * Seeded for this build. Nothing is fetched.
 */
export interface DirectoryPerson {
  id: string;
  name: string;
  email: string;
  rank: 'Partner' | 'Senior associate' | 'Associate' | 'Intern';
  team: string;
  files: number;
}

export const DEFAULT_LIBRARY_URL =
  'https://haletanllp-my.sharepoint.com/personal/knowledge_haletan_com_sg/Documents/Precedents';

export const DIRECTORY: DirectoryPerson[] = [
  {
    id: 'person-chen',
    name: 'Chen Wei Ling',
    email: 'chen.weiling@haletan.com.sg',
    rank: 'Senior associate',
    team: 'Regulatory and Compliance',
    files: 412,
  },
  {
    id: 'person-marcus',
    name: 'Marcus Hale',
    email: 'marcus.hale@haletan.com.sg',
    rank: 'Partner',
    team: 'Regulatory and Compliance',
    files: 908,
  },
  {
    id: 'person-priya',
    name: 'Priya Nair',
    email: 'priya.nair@haletan.com.sg',
    rank: 'Associate',
    team: 'Investment Funds',
    files: 276,
  },
  {
    id: 'person-tomoko',
    name: 'Tomoko Sato',
    email: 'tomoko.sato@haletan.com.sg',
    rank: 'Associate',
    team: 'Regulatory and Compliance',
    files: 188,
  },
  {
    id: 'person-jamie',
    name: 'Jamie Koh',
    email: 'jamie.koh@haletan.com.sg',
    rank: 'Intern',
    team: 'Regulatory and Compliance',
    files: 41,
  },
  {
    id: 'dir-arun',
    name: 'Arun Balakrishnan',
    email: 'arun.b@haletan.com.sg',
    rank: 'Partner',
    team: 'Corporate and Capital Markets',
    files: 1140,
  },
  {
    id: 'dir-elaine',
    name: 'Elaine Foo',
    email: 'elaine.foo@haletan.com.sg',
    rank: 'Senior associate',
    team: 'Corporate and Capital Markets',
    files: 523,
  },
  {
    id: 'dir-daniel',
    name: 'Daniel Ng',
    email: 'daniel.ng@haletan.com.sg',
    rank: 'Associate',
    team: 'Corporate and Capital Markets',
    files: 209,
  },
  {
    id: 'dir-suhaila',
    name: 'Suhaila Rahim',
    email: 'suhaila.rahim@haletan.com.sg',
    rank: 'Partner',
    team: 'Investment Funds',
    files: 861,
  },
  {
    id: 'dir-victor',
    name: 'Victor Tan',
    email: 'victor.tan@haletan.com.sg',
    rank: 'Senior associate',
    team: 'Investment Funds',
    files: 447,
  },
  {
    id: 'dir-mei',
    name: 'Mei Ling Chua',
    email: 'meiling.chua@haletan.com.sg',
    rank: 'Associate',
    team: 'Banking',
    files: 233,
  },
  {
    id: 'dir-rakesh',
    name: 'Rakesh Menon',
    email: 'rakesh.menon@haletan.com.sg',
    rank: 'Partner',
    team: 'Banking',
    files: 774,
  },
];

export const CONNECT_STEPS = [
  'Signing in to the document library',
  'Reading the folder permissions',
  'Resolving people to the practice directory',
  'Grouping people into teams',
];
