const sampleCases = [
  {
    id: "safe-school",
    title: "Safe school announcement",
    inputType: "text",
    privacyMode: true,
    content:
      "Reminder: The school library closes at 4:30 PM today. Please return borrowed calculators by Friday if you still have one.",
  },
  {
    id: "bank-verify",
    title: "Suspicious bank-style email",
    inputType: "text",
    privacyMode: true,
    content:
      "Dear customer, your bank account will be suspended within 24 hours unless you verify your login details now. Click here to confirm your account.",
  },
  {
    id: "gift-card",
    title: "High-risk gift card scam",
    inputType: "text",
    privacyMode: true,
    content:
      "Hi, I need a favor right away. Please buy 3 gift cards for our volunteer event and send me the codes immediately so I can distribute them.",
  },
  {
    id: "safe-url",
    title: "Safe trusted URL",
    inputType: "url",
    privacyMode: true,
    content: "https://www.khanacademy.org/college-careers-more/internet-safety",
  },
  {
    id: "shortened-url",
    title: "Suspicious shortened URL",
    inputType: "url",
    privacyMode: true,
    content: "http://bit.ly/verify-your-payroll",
  },
];

function SampleCases({ onUseSample }) {
  return (
    <section className="card sample-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Try a demo</p>
          <h2>Clickable sample test cases</h2>
        </div>
        <p className="supporting-copy">
          These are synthetic examples for safe testing during a live demo.
        </p>
      </div>

      <div className="sample-grid">
        {sampleCases.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="sample-tile"
            onClick={() => onUseSample(sample)}
          >
            <span className="sample-type">{sample.inputType === "url" ? "URL" : "Email / Text"}</span>
            <strong className="sample-title">{sample.title}</strong>
            <span className="sample-preview">{sample.content}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export { sampleCases };
export default SampleCases;
