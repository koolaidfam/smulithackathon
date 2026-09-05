export type DraftKind = 'mechanical' | 'substantive' | 'jurisdiction';
export type DraftStatus = 'open' | 'accepted' | 'held' | 'decided';
export type DraftView = 'draft' | 'source';

export interface DraftMatter {
  id: string;
  title: string;
  subtitle: string;
  flags: number;
  when: string;
  stage: string;
  html: string;
}

export interface DraftFinding {
  id: string;
  title: string;
  kind: DraftKind;
  location: string;
  warning: string;
  excerpt: string;
  proposed: string | null;
  citation: string;
  why: string;
  signals: { title: string; body: string }[];
  reviewerNote: string;
}

export const SOURCE_PDF = '/family-office-update.pdf';
export const SOURCE_PDF_TITLE = 'Family office reforms · 24 August 2026';

const PASS = (id: string, text: string) =>
  `<span data-pass="${id}" class="pub-flag">${text}</span>`;

const familyOfficeHtml = `
<article class="pub">
  <header class="pub-cover">
    <p class="pub-kicker">Legal update</p>
    <h1>Singapore makes it easier to establish a family office</h1>
    <p class="pub-sub">Two separate reforms explained</p>
    <p class="pub-date">24 August 2026 · Hale &amp; Tan LLP · Investment Funds</p>
  </header>

  <section class="pub-page">
    <p class="pub-lede">The Monetary Authority of Singapore has introduced two reforms that make it more practical for a family to set up and run a family-office structure in Singapore. The first is a class exemption from the capital markets services licence for qualifying single family offices. The second revises the tax-incentive conditions under sections 13O and 13U of the Income Tax Act 1947 for a family-owned fund. ${PASS('f-dates', 'Both reforms take effect on 15 June 2026.')}</p>
    <nav class="pub-toc">
      <p class="pub-label">In this update</p>
      <ol>
        <li>Part one. The SFO’s CMS licensing exemption</li>
        <li>Part two. The family-owned fund’s tax incentive</li>
        <li>Two reforms, one clearer pathway</li>
      </ol>
    </nav>
  </section>

  <section class="pub-page">
    <h2>Part one. The SFO’s CMS licensing exemption</h2>
    <p>Providing fund management services is a regulated activity under the Securities and Futures Act. A person carrying on that business would ordinarily need a CMS licence unless an exemption applies.</p>
    <p>MAS introduced a revised licensing-exemption framework for single family offices with effect from 15 June 2026. A qualifying SFO now has an automatic class exemption from holding a CMS licence for fund management.</p>
    <h3>1. The licensing exemption is now structure-agnostic</h3>
    <p>Previously, an SFO’s ability to rely on an exemption often turned on how the SFO and the fund were legally structured. The related-corporation exemption required a common corporate owner. An SFO and a fund owned directly by family members, or held through trusts, often failed that test. Those families then had to seek a case-by-case exemption and obtain a legal opinion.</p>
    <p>The revised framework gives qualifying SFOs a common class exemption. Broadly, an SFO qualifies if it manages assets only for the family, family-funded charities and certain key employees; is incorporated in Singapore; remains substantially owned and funded by the family; and maintains the required bank accounts for itself and the fund whose investments it manages.</p>
    <h3>2. Qualifying SFOs need only notify MAS and submit annual returns</h3>
    <p>An SFO that satisfies the new conditions is automatically exempted. It does not apply for MAS approval. It files a notice of commencement of business and thereafter submits annual returns confirming that it still qualifies. No legal opinion is required.</p>
  </section>

  <section class="pub-page">
    <h2>Part two. The family-owned fund’s tax incentive</h2>
    <p>Separately, on 31 July 2026, MAS issued a circular revising the conditions for funds seeking tax incentives under sections 13O and 13U. The changes apply to new awards approved on or after 1 August 2026.</p>
    <p>Singapore has not dropped the need for genuine substance. The fund must still have sufficient assets, incur the required expenditure and deploy capital into qualifying investments. The SFO must maintain a genuine investment-management presence in Singapore and employ the required investment professionals.</p>
    <p>What MAS has done is make several of those conditions more practical. The main changes concern hiring, annual spending, monitoring of assets and capital deployment.</p>
    <h3>1. The SFO has more time to complete its investment team</h3>
    <p>Under the previous rules, a fund applying for the section 13O incentive needed two qualifying investment professionals at the time of application, at least one of them a non-family member. A section 13U application needed three, again with at least one non-family member.</p>
    <p>From 1 August 2026, a section 13O fund may apply once its SFO has employed one qualifying investment professional, who may be a family member. The second must be in place by the end of the basis period for the first year of assessment, and by then at least one of the two must be a non-family member.</p>
    <p>A section 13U fund may apply with two qualifying investment professionals, who may be family members. The third must be employed by the end of that first basis period. By then at least one of the three must be a non-family member.</p>
    <p>The fund can therefore apply while recruitment is still running. The staffing condition at the end of the first basis period is unchanged. The application and the hiring can proceed in parallel.</p>
  </section>

  <section class="pub-page">
    <h3>2. Annual spending requirements are more proportionate</h3>
    <p>A fund enjoying a section 13O or 13U award must meet an annual local business spending requirement. The amount depends on assets under management.</p>
    <p>Previously the bands rose quickly: at least S$200,000 below S$50 million of AUM; S$500,000 from S$50 million to below S$100 million; and S$1 million at S$100 million or more.</p>
    <p>The circular restates the current bands as follows. ${PASS('f-spend', 'AUM below S$50 million: at least S$200,000. AUM of S$50 million to below S$100 million: at least S$500,000. AUM of S$100 million or more: at least S$1 million.')}</p>
    <p>The difference is material. A fund with S$80 million of AUM would previously have faced a S$500,000 spend. Under the revised circular the requirement is S$200,000. A fund with S$150 million of AUM moves from the S$1 million tier to the S$200,000 tier. MAS has said the new thresholds follow market norms and are meant to keep SFO-managed funds growing assets in Singapore.</p>
    <h3>3. Minimum fund sizes are unchanged, but monitoring is simpler</h3>
    <p>A section 13O fund must still hold at least S$20 million in designated investments. A section 13U fund must still hold at least S$50 million. Those floors apply at application and at the end of each basis period, not as a continuous intra-year test. Temporary market movements during the year should be less troublesome.</p>
  </section>

  <section class="pub-page">
    <h3>4. Capital deployment is easier to administer</h3>
    <p>The capital deployment requirement is unchanged in amount. The fund must deploy at least the lower of 10% of its AUM or S$10 million into qualifying investments. What has changed is the list of eligible investments and how compliance is measured.</p>
    <p>The previous six categories have been collapsed into three: investments listed on approved exchanges; investments distributed by MAS-licensed financial institutions in Singapore, subject to stated exclusions; and investments in qualifying non-listed Singapore-incorporated operating companies. Compliance is tested at the end of the basis period against AUM in designated investments at that same date, not from twelve month-end snapshots.</p>
    <h3>5. More Singapore investments can receive double recognition</h3>
    <p>Certain investments now count at twice their actual value for the capital deployment test. These include equities listed on approved exchanges, funds that invest substantially in Singapore-listed equities, qualifying blended-finance instruments distributed by licensed financial institutions in Singapore, and qualifying investments in non-listed Singapore operating companies. A S$5 million investment in a qualifying private operating company may therefore be recognised as S$10 million for the test.</p>
    <h3>6. Physical precious metals</h3>
    <p>${PASS('f-ipm', 'Investments in physical investment precious metals qualify as designated investments only if they do not exceed 5% of the fund’s total investment portfolio.')}</p>
  </section>

  <section class="pub-page">
    <h3>7. What has not changed</h3>
    <p>The fund must still meet the S$20 million or S$50 million minimum AUM, satisfy the annual local business spending requirement, comply with the capital deployment requirement, meet the other conditions of the relevant incentive, and maintain the required private-banking relationship with an MAS-licensed financial institution.</p>
    <p>The SFO must still establish a genuine investment-management presence in Singapore, employ two qualifying investment professionals for a section 13O fund or three for a section 13U fund, and ensure that at least one of them is a non-family member.</p>
    <h2>Two reforms, one clearer pathway</h2>
    <p>The June framework simplifies the SFO’s licensing position. A qualifying SFO can rely on a structure-agnostic class exemption. It notifies MAS and files an annual return. MAS approval and a supporting legal opinion are not required.</p>
    <p>The August changes apply to the fund’s section 13O or 13U award. The fund can apply while the SFO is still completing its investment team. Funds with less than S$250 million of AUM face a more proportionate spending requirement. Minimum AUM floors stay the same, but they are easier to monitor. The capital deployment rules are easier to administer.</p>
    <p>${PASS('f-existing', 'Funds that already hold a section 13O or 13U award will automatically move onto the new spending bands and capital deployment tests.')}</p>
    <p>The substantive requirements remain. Families should now find it more practical to establish and operate an SFO and its fund in Singapore under the two incentives.</p>
    <p class="pub-disclaimer">This note is a working draft for Hale &amp; Tan clients. It is not legal advice. A named partner decides the outward wording before publication.</p>
    <footer class="pub-contacts">
      <p class="pub-label">Questions on this note</p>
      <p><strong>Priya Nair</strong><br />Senior Associate, Investment Funds<br />priya.nair@haleandtan.sg</p>
      <p><strong>Chen Wei Ling</strong><br />Senior Partner, Regulatory<br />chen.weiling@haleandtan.sg</p>
      <p>Hale &amp; Tan LLP · Singapore</p>
    </footer>
  </section>
</article>
`;

const newsletterHtml = `
<article class="pub">
  <header class="pub-cover">
    <p class="pub-kicker">Internal publication</p>
    <h1>Funds team newsletter</h1>
    <p class="pub-sub">Week of 1 September 2026</p>
    <p class="pub-date">Hale &amp; Tan LLP · Investment Funds</p>
  </header>
  <section class="pub-page">
    <p>This week’s note should point the team at the family-office update, not at last year’s related-corporation exemption memo. Edit the paragraphs below, then send the draft to Priya Nair.</p>
    <p>MAS has made it easier to stand up a single family office in Singapore. Qualifying SFOs now rely on a class exemption from the CMS licence. They notify MAS and file annual returns. They do not apply for a case-by-case exemption and they do not need a legal opinion on related-corporation status.</p>
    <p>The tax-incentive circular of 31 July 2026 is a separate instrument. It revises the section 13O and 13U conditions for new awards approved from 1 August 2026. Do not tell fee-earners that every existing award has already moved onto the new spending bands.</p>
  </section>
</article>
`;

const priorNoteHtml = `
<article class="pub">
  <header class="pub-cover">
    <p class="pub-kicker">Prior client note</p>
    <h1>SFO licensing. Related-corporation exemption</h1>
    <p class="pub-sub">House note, March 2026</p>
    <p class="pub-date">Hale &amp; Tan LLP · Investment Funds</p>
  </header>
  <section class="pub-page">
    <p>This note is stale. From 15 June 2026 a qualifying single family office uses the class exemption. Rewrite the opening before anyone reprints it.</p>
    <p>An SFO that cannot show it is a related corporation of the fund must apply to MAS for a case-by-case CMS licensing exemption and obtain a legal opinion confirming the structure.</p>
    <p>Trust-held and directly owned family structures often fail the related-corporation test. Those families should budget time for the exemption application before the SFO begins managing assets.</p>
  </section>
</article>
`;

export const draftMatters: DraftMatter[] = [
  {
    id: 'mat-sfo',
    title: 'Client advisory: family office reforms',
    subtitle: 'Outward publication · Investment Funds',
    flags: 4,
    when: 'In force since 1 Aug 2026',
    stage: 'Initial draft',
    html: familyOfficeHtml,
  },
  {
    id: 'mat-news',
    title: 'Funds team newsletter',
    subtitle: 'Internal publication',
    flags: 2,
    when: 'This week',
    stage: 'Not started',
    html: newsletterHtml,
  },
  {
    id: 'mat-sfo-old',
    title: 'Prior note: SFO licensing',
    subtitle: 'Client note, March 2026',
    flags: 1,
    when: 'Stale after 15 June 2026',
    stage: 'Needs a republication',
    html: priorNoteHtml,
  },
];

export const draftFindings: DraftFinding[] = [
  {
    id: 'f-dates',
    title: 'Two commencement dates blended',
    kind: 'mechanical',
    location: 'Working draft · opening paragraph',
    warning: 'The draft dates both reforms to 15 June 2026.',
    excerpt: 'Both reforms take effect on 15 June 2026.',
    proposed:
      'The CMS class exemption took effect on 15 June 2026. The revised 13O and 13U conditions apply to new awards approved on or after 1 August 2026.',
    citation: 'MAS SFO class exemption, 15 June 2026 · MAS 13O/13U circular, 31 July 2026',
    why: 'The two instruments commence on different days. Naming both dates follows from the gazettal. No judgement.',
    signals: [
      {
        title: 'Readers will apply the tax circular too early',
        body: 'A single date next to two reforms is how a neat opening sentence hardcodes the wrong commencement.',
      },
    ],
    reviewerNote: 'Keep each date next to the instrument it belongs to.',
  },
  {
    id: 'f-spend',
    title: 'Stale AUM spending bands',
    kind: 'mechanical',
    location: 'Working draft · part two, annual spending',
    warning: 'The “current” bands are last year’s thresholds.',
    excerpt:
      'AUM below S$50 million: at least S$200,000. AUM of S$50 million to below S$100 million: at least S$500,000. AUM of S$100 million or more: at least S$1 million.',
    proposed:
      'AUM below S$250 million: at least S$200,000. AUM of S$250 million to below S$2 billion: at least S$500,000. AUM of S$2 billion or more: at least S$1 million.',
    citation: 'MAS 13O/13U circular, 31 July 2026, awards from 1 August 2026',
    why: 'The figures are discrete parameters. Replacing them follows from the circular with no judgement.',
    signals: [
      {
        title: 'Looks current on the page',
        body: 'The sentence is fluent and still cites real tiers. A busy reviewer can miss that S$50 million and S$100 million are the old cut-offs.',
      },
      {
        title: 'The example already uses the new math',
        body: 'The next paragraph says an S$80 million fund now spends S$200,000. That only holds under the revised bands.',
      },
    ],
    reviewerNote: 'A partner still decides whether this sentence goes in the outward note.',
  },
  {
    id: 'f-ipm',
    title: 'Precious-metals cap still stated as current',
    kind: 'mechanical',
    location: 'Working draft · part two, physical precious metals',
    warning: 'The draft still recites the 5% cap on physical investment precious metals.',
    excerpt:
      'Investments in physical investment precious metals qualify as designated investments only if they do not exceed 5% of the fund’s total investment portfolio.',
    proposed:
      'From 1 August 2026, the 5% cap on physical investment precious metals is removed. Qualifying gold, silver and platinum may be treated as designated investments without that limit.',
    citation: 'MAS 13O/13U circular, 31 July 2026',
    why: 'Removal of a stated percentage cap is a discrete parameter change. The replacement names the date and the lift. No judgement.',
    signals: [
      {
        title: 'Copied from the previous house note',
        body: 'The 5% sentence was true in 2025. House voice makes it easy to reprint as if it were still the rule.',
      },
    ],
    reviewerNote: 'Keep the commencement date next to the lift of the cap.',
  },
  {
    id: 'f-existing',
    title: 'Existing awards',
    kind: 'substantive',
    location: 'Working draft · closing pathway',
    warning: 'Whether funds already on 13O or 13U move onto the new tests is a judgement call.',
    excerpt:
      'Funds that already hold a section 13O or 13U award will automatically move onto the new spending bands and capital deployment tests.',
    proposed: null,
    citation:
      'MAS 13O/13U circular, 31 July 2026 · the circular applies to new awards approved on or after 1 August 2026',
    why: 'The model will not draft replacement text. Show the parameter delta, cite the circular, and name the lawyer who decides.',
    signals: [
      {
        title: 'Easy to overclaim',
        body: 'A tidy closing sentence that tells every existing award-holder they have already moved looks helpful and may be wrong for their file.',
      },
    ],
    reviewerNote: 'Priya Nair or Chen Wei Ling decides the wording. The brain stops at the question.',
  },
];
