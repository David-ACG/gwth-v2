/**
 * Every public word on the gift pages, in reading order, so the copy pass
 * (the latest GPT Sol, per the gwth-public-writing skill) reviews one file.
 * Prices and dates are passed in, never typed into the words.
 */

export const GIFT_COPY = {
  meta: {
    title: "Give the GWTH course",
    description:
      "Give the whole GWTH course or the first month. They choose when to open it. The gift never renews, and we never ask for their card.",
  },
  masthead: {
    title: "Give someone",
    titleAccent: "the GWTH course",
    standfirst:
      "GWTH is a practical AI course for work and everyday life in the UK. It runs for three months, at about five hours a week. Give the whole course or the first month. Their time starts when they open it. We never ask for their card.",
  },
  notOnSale: {
    title: (opensOn: string) => `Gifts go on sale on ${opensOn}`,
    body: "From 1 December 2026 to 6 January 2027 you can give the whole three-month course for £69, or the first month for £29. After that, the whole course costs £87. If you already have a gift code, you can open it now.",
  },
  products: {
    legend: "Choose a gift",
    course: {
      title: "The whole course",
      note: (saleEndsOn: string | null) =>
        saleEndsOn
          ? `Months 1, 2 and 3. Christmas price until ${saleEndsOn}.`
          : "Months 1, 2 and 3.",
    },
    month1: {
      title: "The first month",
      note: "Month 1. They can choose to pay for Months 2 and 3 afterwards.",
    },
    selected: "Selected",
    // Read aloud between the sale price and the struck-through one.
    was: ", was",
  },
  recipient: {
    legend: "Who is it for?",
    name: "Their name",
    email: "Their email address",
    emailHint: "We'll send the gift here. We only use it for this gift.",
  },
  from: {
    legend: "From you",
    name: "Your name on the gift",
    message: "A message (optional)",
    messageHint: "Up to 500 characters.",
  },
  delivery: {
    legend: "When should we email it?",
    christmas: (at: string) => `On Christmas morning (${at} UK time)`,
    now: "Straight away",
    date: "On a date I choose (at about 7am UK time)",
    dateLabel: "Date",
  },
  pay: {
    button: (price: string) => `Continue to payment (${price})`,
    note: "You'll pay on Stripe's secure page. We'll then email your receipt and a gift card to print.",
    // "By paying, you agree to our Terms. To refund a gift that hasn't been
    // opened, contact us." The two links sit between the parts.
    agree: "By paying, you agree to our",
    terms: "Terms",
    refund: "To ask for a refund before the gift is opened,",
    contact: "contact us",
  },
  links: {
    haveCode: "Have a gift code?",
    openIt: "Open your gift",
    forYourself: "Buying it for yourself?",
    seePrices: "See the prices",
  },
  answers: [
    {
      title: "When does their time start?",
      body: "When they open the gift with its code on GWTH, not when the email arrives. They must open it within one year of purchase.",
    },
    {
      title: "What if a month isn't ready yet?",
      body: "Their time is paused until that month opens, so they don't lose any of their course.",
    },
    {
      title: "What happens at the end?",
      body: "Their access to the course lessons ends without renewing. We'll email them about continuing. Contact us for a full refund before the gift is opened. Once opened, gifts aren't refundable unless the law requires.",
    },
  ],
  errors: {
    generic: "We couldn't start the payment. Please try again.",
    recipientName: "Please add their name.",
    recipientEmail: "Please add a valid email address.",
    buyerName: "Please add your name.",
    date: "Please choose a date.",
  },
} as const

export const OPEN_COPY = {
  meta: {
    title: "Open your gift",
    description: "Open a GWTH gift and start the course.",
  },
  masthead: {
    title: "Open your",
    titleAccent: "gift",
    standfirst:
      "Enter the code from your gift email or card. You'll need a free GWTH account to open it. Your time starts when you open the gift.",
  },
  enter: {
    label: "Gift code",
    placeholder: "GWTH-XXXX-XXXX-XXXX",
    button: "Find my gift",
    empty: "Enter the code from your gift email or card.",
  },
  // "Can't find your code? ... contact us." with Contact linked.
  lostCode: {
    lead: "Can't find your code? It's in the gift email and on the printed gift card. If you still can't find it,",
    link: "contact us",
  },
  notFound: "We can't find that code. Please check it and try again.",
  found: {
    course: "The whole GWTH course: Months 1, 2 and 3",
    month1: "The first month of the GWTH course",
    from: (name: string) => `From ${name}`,
    openBy: (date: string) => `Open it by ${date}`,
  },
  signedOut: {
    body: "Sign in or create a free GWTH account and confirm your email to open your gift.",
    create: "Create an account",
    signIn: "Sign in",
  },
  signedIn: {
    body: (email: string) => `You're opening the gift on your account, ${email}. Month 1 starts straight away.`,
    button: "Open it now",
  },
  alreadyYours: {
    title: "This gift is open on your account",
    button: "Go to your course",
  },
  hasAccess: {
    title: "You already have the course",
    body: "Keep the code to open later, or give it to someone else. It must be opened by the date shown.",
  },
  refunded: { title: "This gift was refunded", body: "It can't be opened. If you think that's wrong, please contact us." },
  expired: { title: "The time to open this gift has passed", body: "Please contact us and we'll help." },
  openedElsewhere: {
    title: "This gift has already been opened",
    body: "It was opened on a different account. If that wasn't you, please contact us.",
  },
  contact: "Contact us",
} as const

export const THANKS_COPY = {
  meta: { title: "Thank you", description: "Your GWTH order." },
  pending: {
    title: "We’re confirming your payment",
    body: "This usually takes a few seconds. Refresh this page in a moment. Once it's confirmed, you'll see your gift or course details here, and we'll email you a receipt.",
    helpLead: "If this hasn't changed after a few minutes,",
    helpLink: "contact us",
  },
  // Opened without the payment details Stripe adds to the link.
  noPayment: {
    title: "We can't check a payment from this link",
    body: "Stripe returns you to this page after payment. If you've already paid, your receipt email has everything you need.",
    gift: "Give a gift",
    contact: "Contact us",
  },
  // The refund rule, as in the Terms (section 7).
  refund: {
    lead: "For a full refund before the gift is opened,",
    contact: "contact us",
    rest: ". Once it's opened, it isn't refundable unless the law requires. See our",
    terms: "Terms",
  },
  gift: {
    title: "Thank you.",
    titleAccent: "Your gift is ready.",
    body: (who: string, when: string) =>
      `We'll email ${who} on ${when} at about 7am UK time, with your message and a link to open the gift.`,
    sentNow: (who: string) => `We've emailed ${who} with your message and a link to open the gift.`,
    // The send time has passed but the email has not been confirmed as sent.
    sending: (who: string) =>
      `We'll email ${who} your message and a link to open the gift. If it doesn't arrive, please contact us.`,
    code: "Gift code",
    openBy: "Open it by",
    printNote: "To give it in person, print the gift card. The code works without the email.",
    print: "Print the gift card",
  },
  self: {
    title: "Thank you.",
    titleAccent: "Your course has started.",
    titleAccentNotOpened: "Your course is ready.",
    body: "Month 1 is open in your account now. We've emailed you a receipt.",
    button: "Start Month 1",
    notOpened:
      "Open your course from the link in your receipt email when you're ready to begin.",
  },
} as const

export const CARD_COPY = {
  meta: {
    title: "Your GWTH gift card",
    description: "GWTH is a practical AI course for work and everyday life in the UK.",
  },
  heading: (name: string | null) => (name ? `A gift for ${name}` : "A gift for you"),
  what: {
    course: "The whole GWTH course: Months 1, 2 and 3",
    month1: "The first month of the GWTH course",
  },
  from: (name: string) => `From ${name}`,
  howTo: (site: string) => `Open it at ${site}/gift/open with this code:`,
  openBy: (date: string) => `Open it by ${date}. Your time starts when you open it.`,
  print: "Print this card",
  notFound: "We can't find that gift code.",
  notFoundHelp:
    "The link to the gift card is in the receipt email we sent when the gift was bought. If you have the gift code, you can open the gift with it.",
  openGift: "Open your gift",
  contact: "Contact us",
  terms: "Terms",
  privacy: "Privacy",
  // Shown on screen to the buyer, above the card; never printed.
  thanks: (buyer: string | null) => (buyer ? `Thank you, ${buyer}.` : "Thank you."),
  sent: (who: string, date: string) => `We emailed your gift to ${who} on ${date}.`,
  sending: (who: string) => `We'll email your gift to ${who}. If it doesn't arrive, please contact us.`,
  willSend: (who: string, date: string) => `We'll email your gift to ${who} on ${date} at about 7am UK time.`,
  printToo: "You can also print this card and give it to them yourself.",
  back: "Back to GWTH.ai",
} as const

/** The pricing-page band (bead gwth-launch-v1uj.5, row 1.5). */
export const PRICING_OFFER_COPY = {
  sale: {
    title: "The whole course for",
    titleAccent: (price: string, saleEndsOn: string) => `${price} until ${saleEndsOn}`,
    body: (sale: string, full: string, saleEndsOn: string) =>
      `Pay once for all three months: ${sale} instead of ${full}, until ${saleEndsOn}. Buy it for yourself or give it as a gift.`,
  },
  allYear: {
    title: "Pay once",
    titleAccent: "for the whole course",
    body: (full: string, month: string) =>
      `Pay ${full} once for all three months, or give someone the whole course or the first month (${month}) as a gift.`,
  },
  buySelf: (price: string) => `Buy the whole course (${price})`,
  gift: "Give it as a gift",
  monthly: (price: string) => `Join for ${price} a month`,
} as const
