export const lessons = [
  {
    id: "urgency",
    title: "Urgency is a common scam tactic",
    duration: "30 sec lesson",
    summary: "Learn why pressure and countdowns are red flags.",
    explanation: [
      "Scammers often try to rush you so you do not have time to think clearly.",
      "A message that says you must act right now is often trying to create panic, not help you.",
    ],
    warningSign: 'Warning sign: "Respond in 10 minutes or your account will be locked."',
    question: {
      prompt: "What is the safest response when a message pressures you to act immediately?",
      options: [
        "Pause and verify through an official source",
        "Click the link quickly before it expires",
        "Reply with your details to avoid trouble",
      ],
      correctAnswer: "Pause and verify through an official source",
      feedback:
        "Correct — urgency is often used to pressure people into acting fast.",
      explanation:
        "Taking a moment to verify through an official website, app, or phone number helps you avoid rushed mistakes.",
      takeaway: "Takeaway: Real companies can wait a few minutes while you verify safely.",
    },
  },
  {
    id: "links",
    title: "How to spot suspicious links",
    duration: "30 sec lesson",
    summary: "Practice checking links before you tap or click.",
    explanation: [
      "A link can look friendly while secretly leading somewhere unsafe.",
      "Before you open it, look for odd spelling, extra words, or a website name that does not match the company.",
    ],
    warningSign: "Warning sign: a bank message links to secure-bank-login-help.net instead of the bank's real website.",
    question: {
      prompt: "Which link is the biggest warning sign?",
      options: [
        "A link with a misspelled company name",
        "A saved bookmark to the official website",
        "A website address you typed yourself",
      ],
      correctAnswer: "A link with a misspelled company name",
      feedback: "Correct — suspicious links often copy a real brand but change the web address.",
      explanation:
        "Scam links may add extra words, swap letters, or use a different ending to trick you into trusting them.",
      takeaway: "Takeaway: When in doubt, do not tap the link. Open the official site yourself.",
    },
  },
  {
    id: "codes",
    title: "Never share passwords or verification codes",
    duration: "30 sec lesson",
    summary: "Know which secrets should stay private every time.",
    explanation: [
      "Passwords and one-time verification codes are meant only for you.",
      "If someone asks for them by text, email, or phone, that is a strong sign something is wrong.",
    ],
    warningSign: 'Warning sign: "Tell me the 6-digit code we just sent so I can confirm your identity."',
    question: {
      prompt: "What should you do if someone asks for your password or verification code?",
      options: [
        "Do not share it and end the conversation",
        "Share it if they sound official",
        "Send part of it to be safe",
      ],
      correctAnswer: "Do not share it and end the conversation",
      feedback:
        "Correct — passwords and verification codes should never be shared.",
      explanation:
        "Legitimate support teams do not need you to reveal your password or one-time code to them.",
      takeaway: "Takeaway: If a message asks for a secret code, stop and treat it as suspicious.",
    },
  },
  {
    id: "impersonation",
    title: "How impersonation scams work",
    duration: "30 sec lesson",
    summary: "Spot when someone pretends to be a trusted person or brand.",
    explanation: [
      "Scammers often pretend to be a bank, delivery service, teacher, boss, or family member.",
      "They borrow familiar names and logos to earn trust before asking for money, information, or a fast response.",
    ],
    warningSign: 'Warning sign: "Hi Mom, this is my new number. I need you to send money today."',
    question: {
      prompt: "What is the safest way to respond to a message from someone claiming to be a trusted person?",
      options: [
        "Verify using a phone number or contact method you already know",
        "Reply in the same message thread right away",
        "Send help first and ask questions later",
      ],
      correctAnswer: "Verify using a phone number or contact method you already know",
      feedback:
        "Correct — the safest choice is to verify through a contact method you trust.",
      explanation:
        "Using a saved number, official website, or known account helps you confirm the message is really from them.",
      takeaway: "Takeaway: Familiar names can be faked, so verify before you act.",
    },
  },
];
