import { describe, expect, it } from "vitest"
import {
  Redactor,
  expandSpellings,
  isValidIban,
  isValidNhsNumber,
  parseNameLines,
  passesLuhn,
} from "./redact"

const plain = (text: string) => new Redactor().redact(text).text

describe("pattern details", () => {
  it("hides email addresses", () => {
    expect(plain("Write to sam.jones+gp@example.co.uk today")).toBe("Write to [Email 1] today")
  })

  it("hides UK mobile and landline numbers in their usual spellings", () => {
    expect(plain("Call 07700 900123.")).toBe("Call [Phone 1].")
    expect(plain("Call +44 7700 900123 now")).toBe("Call [Phone 1] now")
    expect(plain("School: 020 7946 0018")).toBe("School: [Phone 1]")
    expect(plain("Ring (01632) 960 001")).toBe("Ring [Phone 1]")
    expect(plain("Office +44 (0) 20 7946 0018")).toBe("Office [Phone 1]")
  })

  it("gives the same number the same label in every spelling", () => {
    const r = new Redactor()
    expect(r.redact("07700 900123 or 07700900123 or +447700900123").text).toBe("[Phone 1] or [Phone 1] or [Phone 1]")
  })

  it("hides international numbers", () => {
    expect(plain("Dad in Spain: +34 612 345 678")).toBe("Dad in Spain: [Phone 1]")
  })

  it("leaves dates, times, prices and years alone", () => {
    const text = "Swimming on 12/03/2026 at 16:30, costs £12.50, since 2019, 45 minutes."
    expect(plain(text)).toBe(text)
  })

  it("hides UK postcodes in upper or lower case, but not lesson codes", () => {
    expect(plain("We live at SW1A 1AA.")).toBe("We live at [Postcode 1].")
    expect(plain("near m1 1ae")).toBe("near [Postcode 1]")
    expect(plain("See L23 Blueprint and M1 L24.")).toBe("See L23 Blueprint and M1 L24.")
  })

  it("hides NHS numbers that pass the check digit, or sit next to the word NHS", () => {
    expect(isValidNhsNumber("943 476 5919")).toBe(true)
    expect(plain("Number 943 476 5919")).toBe("Number [NHS number 1]")
    expect(plain("NHS no: 1234567890")).toBe("NHS no: [NHS number 1]")
  })

  it("hides sort codes and account numbers when the words say so", () => {
    expect(plain("Sort code 12-34-56, account number 12345678")).toBe(
      "Sort code [Sort code 1], account number [Account number 1]",
    )
    expect(plain("Order 12345678 arrives Friday")).toBe("Order 12345678 arrives Friday")
  })

  it("hides IBANs and card numbers that pass their checks", () => {
    expect(isValidIban("GB82 WEST 1234 5698 7654 32")).toBe(true)
    expect(plain("Pay GB82 WEST 1234 5698 7654 32 please")).toBe("Pay [Account number 1] please")
    expect(passesLuhn("4111 1111 1111 1111")).toBe(true)
    expect(plain("Card 4111 1111 1111 1111.")).toBe("Card [Card number 1].")
    expect(plain("Card 4111 1111 1111 1112.")).toBe("Card 4111 1111 1111 1112.")
  })

  it("hides API keys and the value after password or api_key", () => {
    expect(plain("OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwx1234")).toBe("OPENAI_API_KEY=[Secret 1]")
    expect(plain('password: "hunter2hunter2"')).toBe('password: "[Secret 1]"')
    expect(plain("api_key = process.env.OPENAI_API_KEY")).toBe("api_key = process.env.OPENAI_API_KEY")
  })
})

describe("listed names", () => {
  const entries = [
    { kindLabel: "Child", names: ["Amelia Jones", "Millie"] },
    { kindLabel: "Child", names: ["Oscar"] },
    { kindLabel: "School", names: ["St Mary's Primary"] },
  ]

  it("maps every spelling of one person to one label, in list order", () => {
    const r = new Redactor(entries)
    expect(r.redact("Amelia Jones (Millie) and Oscar go to St Mary's Primary.").text).toBe(
      "[Child 1] ([Child 1]) and [Child 2] go to [School 1].",
    )
  })

  it("hides a first name on its own, any case, and keeps possessives", () => {
    const r = new Redactor(entries)
    expect(r.redact("amelia's swimming; OSCAR's tea").text).toBe("[Child 1]'s swimming; [Child 2]'s tea")
  })

  it("does not hide a name inside a longer word", () => {
    const r = new Redactor([{ kindLabel: "Child", names: ["Al"] }])
    expect(r.redact("Al needs Alka-Seltzer and an alarm").text).toBe("[Child 1] needs Alka-Seltzer and an alarm")
  })

  it("keeps labels consistent across files and counts every use", () => {
    const r = new Redactor(entries)
    const brief = r.redact("Oscar: dentist, call 07700 900123")
    const digest = r.redact("Reminder for Oscar. Dentist on 07700900123. Amelia has swimming.")
    expect(brief.text).toBe("[Child 2]: dentist, call [Phone 1]")
    expect(digest.text).toBe("Reminder for [Child 2]. Dentist on [Phone 1]. [Child 1] has swimming.")
    expect(r.summary()).toEqual([
      { label: "[Child 1]", kind: "Child", source: "name", count: 1 },
      { label: "[Child 2]", kind: "Child", source: "name", count: 2 },
      { label: "[Phone 1]", kind: "Phone", source: "pattern", count: 2 },
    ])
    expect(r.unusedNameLabels()).toEqual(["[School 1]"])
  })

  it("treats a name inside an email address as part of the address", () => {
    const r = new Redactor([{ kindLabel: "Partner", names: ["Sam"] }])
    expect(r.redact("Sam: sam@example.com").text).toBe("[Partner 1]: [Email 1]")
  })

  it("never keeps the original values in its summary", () => {
    const r = new Redactor(entries)
    r.redact("Amelia, 07700 900123, SW1A 1AA")
    expect(JSON.stringify(r.summary())).not.toMatch(/Amelia|07700|SW1A/)
  })
})

describe("the names box", () => {
  const kinds = [
    { id: "child", label: "Child" },
    { id: "school", label: "School" },
  ]

  it("reads one person per line with a kind and aliases", () => {
    expect(parseNameLines("Child: Amelia Jones, Millie\n\nschool: Hillside\nGranny Pat", kinds, "Detail")).toEqual([
      { kindLabel: "Child", names: ["Amelia Jones", "Millie"] },
      { kindLabel: "School", names: ["Hillside"] },
      { kindLabel: "Detail", names: ["Granny Pat"] },
    ])
  })

  it("adds the first word of a full name but not the surname", () => {
    expect(expandSpellings(["Amelia Jones"])).toEqual(["Amelia Jones", "Amelia"])
    expect(expandSpellings(["A", " "])).toEqual([])
  })

  it("never hides the first word of a place, school or address on its own", () => {
    // Found on the hlab proof run: "14 Elm Road" hid every "14" in the brief.
    expect(expandSpellings(["14 Elm Road"], false)).toEqual(["14 Elm Road"])
    expect(expandSpellings(["14 Elm Road"], true)).toEqual(["14 Elm Road"])
    const r = new Redactor([
      { kindLabel: "Place", names: ["14 Elm Road"] },
      { kindLabel: "School", names: ["St Mary's Primary"] },
    ])
    expect(r.redact("Week of 14 to 20 December. St Albans trip. Home: 14 Elm Road; St Mary's Primary.").text).toBe(
      "Week of 14 to 20 December. St Albans trip. Home: [Place 1]; [School 1].",
    )
  })
})
