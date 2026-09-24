export interface GlossaryTerm {
  term: string;
  arabic?: string;
  simpleDefinition: string;
  detailedExplanation: string;
  category: "Structure" | "Legal Principle" | "Financial Term" | "Prohibition";
  example: string;
}

export const GLOSSARY_TERMS: Record<string, GlossaryTerm> = {
  murabahah: {
    term: "Murabahah",
    arabic: "المرابحة",
    simpleDefinition: "A disclosed cost-plus sale where the financier purchases an asset and sells it to you at cost plus an agreed profit.",
    detailedExplanation: "Instead of simply lending cash at interest, the financier acts as a bona fide merchant. The financier buys the physical property from the seller, takes constructive ownership and risk, and then resells it to you at an agreed price that includes a clearly disclosed profit margin payable in fixed deferred installments.",
    category: "Structure",
    example: "Financier buys property for £280,000, sells it to you for £350,000 payable over 15 years in fixed monthly installments."
  },
  musharakah: {
    term: "Musharakah",
    arabic: "المشاركة",
    simpleDefinition: "A genuine equity partnership where two or more parties pool capital to finance an asset and share profits and losses.",
    detailedExplanation: "In commercial Musharakah, both you and the investor are genuine co-owners and business partners. Operational profits generated (such as rental income from commercial units) are shared according to an agreed ratio, while any financial loss of capital must strictly be shared in exact proportion to capital contributions.",
    category: "Structure",
    example: "You invest 30% and an investor contributes 70% to acquire a commercial building. Net rental cashflow is distributed monthly."
  },
  diminishingMusharakah: {
    term: "Diminishing Musharakah",
    arabic: "المشاركة المتناقصة",
    simpleDefinition: "A joint co-ownership structure where you gradually buy out the financier's equity units while paying rent on their remaining share.",
    detailedExplanation: "Starts with joint ownership (Shirkat-ul-Milk). You reside in or use the property, so you pay rent on the financier's share. Each month you also buy a fraction of their equity units. As your ownership increases, the financier's stake decreases, and your monthly rent reduces proportionally until you become the 100% sole owner.",
    category: "Structure",
    example: "Starting at 20% your share and 80% financier share; each month your ownership rises by 0.44% and rent drops, reaching 100% ownership at maturity."
  },
  ijarah: {
    term: "Ijarah Muntahia Bittamleek",
    arabic: "الإجارة المنتهية بالتمليك",
    simpleDefinition: "A lease of the right to use a property (usufruct) that concludes with transferring ownership to the customer.",
    detailedExplanation: "The financier purchases and retains ownership of the property, granting you the legal right to use it (usufruct) in exchange for monthly rent. Alongside rent, you pay capital amortization. At the conclusion of all payments, ownership is formally transferred via a separate deed of gift (Hibah) or nominal sale.",
    category: "Structure",
    example: "You lease a home from the financier for 15 years, paying rent and capital. Upon completing payments, ownership is gifted to you."
  },
  shirkatUlMilk: {
    term: "Shirkat-ul-Milk",
    arabic: "شركة الملك",
    simpleDefinition: "Proprietary co-ownership where two or more parties hold undivided title in a physical asset.",
    detailedExplanation: "An authentic co-ownership partnership created when two parties contribute capital to acquire an indivisible asset like a house or commercial building, giving each party property rights proportional to their contribution.",
    category: "Legal Principle",
    example: "You and the financier jointly appear on title or legal deed holding 20% and 80% respective ownership shares."
  },
  usufruct: {
    term: "Usufruct (Manfa'ah)",
    arabic: "المنفعة",
    simpleDefinition: "The legal right to use, occupy, and benefit from an asset without owning the underlying property itself.",
    detailedExplanation: "In Islamic jurisprudence, ownership of an asset (Raqabah) is distinct from the right to use it (Manfa'ah). In leasing (Ijarah), rent is paid solely for the usufruct. If the property becomes uninhabitable or destroyed, the usufruct ceases and rent cannot be charged.",
    category: "Legal Principle",
    example: "Living in a home gives you the usufruct (occupancy rights), while the structural owner retains the asset foundation."
  },
  waad: {
    term: "Wa'ad (Unilateral Promise)",
    arabic: "الوعد الملزم",
    simpleDefinition: "A binding unilateral undertaking by one party to perform a future action, such as buying equity units or transferring title.",
    detailedExplanation: "Shariah forbids combining two mutually contingent contracts into one (e.g. you cannot have a contract that is simultaneously a lease and a sale). Instead, one party makes an independent, binding unilateral promise (Wa'ad) to buy equity units or transfer title upon satisfying lease terms.",
    category: "Legal Principle",
    example: "The customer undertakes a binding promise to buy equity units from the investor month by month."
  },
  hamishJiddiyyah: {
    term: "Hamish Jiddiyyah",
    arabic: "هامش الجدية",
    simpleDefinition: "A security deposit or earnest money provided by the customer to prove serious intent to conclude a transaction.",
    detailedExplanation: "An advance amount deposited with the financier to indicate serious commercial commitment. If the customer defaults without justification before contract execution, the financier may only deduct actual verified administrative damages incurred.",
    category: "Financial Term",
    example: "The 20% down payment you provide upfront when initiating the property purchase."
  },
  takaful: {
    term: "Takaful",
    arabic: "التكافل",
    simpleDefinition: "Islamic cooperative mutual protection based on shared responsibility, mutual assistance, and donation (Tabarru').",
    detailedExplanation: "Unlike conventional commercial insurance which involves uncertainty (Gharar) and interest (Riba), Takaful operates as a cooperative mutual fund where participants donate contributions to protect each other against property loss or damage.",
    category: "Structure",
    example: "Property building protection structured through a certified Shariah-compliant mutual Takaful pool."
  },
  qabd: {
    term: "Qabd (Possession & Risk Assumption)",
    arabic: "القبض",
    simpleDefinition: "Taking physical or constructive legal possession of an asset and assuming ownership risk before reselling or leasing it.",
    detailedExplanation: "Under the Sunnah of the Prophet (peace be upon him), one cannot sell an asset before taking possession of it. The financier must take genuine ownership risk (Daman) of the property before executing a Murabahah sale or Ijarah lease.",
    category: "Legal Principle",
    example: "The financier becomes the owner of the house from the vendor before reselling it to you."
  },
  riba: {
    term: "Riba (Usury / Pure Interest)",
    arabic: "الربا",
    simpleDefinition: "Any unjustified increase, interest charge, or monetary surplus earned purely from lending money without asset risk.",
    detailedExplanation: "In Islamic economics, money has no intrinsic utility; it is merely a medium of exchange and measure of value. Earning money simply by lending money (interest) without participating in genuine economic trade, asset ownership, or commercial risk is strictly prohibited in the Quran.",
    category: "Prohibition",
    example: "Conventional banks lending £200,000 and demanding back £350,000 purely through the compounding time value of money."
  },
  ibra: {
    term: "Ibra' (Discretionary Rebate)",
    arabic: "الإبراء",
    simpleDefinition: "A voluntary rebate or waiver of remaining unearned profit granted by a financier upon early settlement.",
    detailedExplanation: "Under Murabahah, the agreed deferred price is a fixed debt. However, if the customer settles the entire balance early, Shariah standards permit the financier at its sole discretion to grant a rebate (Ibra') on future unearned profit margins.",
    category: "Financial Term",
    example: "Settling a 15-year Murabahah in Year 5, where the financier voluntarily waives a substantial portion of the remaining profit."
  },
  profitVsRent: {
    term: "Profit vs. Rent vs. Interest",
    simpleDefinition: "Profit arises from trade and risk; rent arises from usufruct of tangible property; interest arises solely from a monetary loan.",
    detailedExplanation: "Profit (Ribh) is earned from the sale of an asset at an agreed markup where the seller bore ownership risk. Rent (Ujrah) is paid for using a physical asset owned by another. Interest (Riba) is money paid purely for borrowing money, with no underlying asset ownership or commercial risk taken by the lender.",
    category: "Financial Term",
    example: "Paying rent because you live in an apartment is legitimate; paying interest on cash borrowed from a lender is not."
  }
};
