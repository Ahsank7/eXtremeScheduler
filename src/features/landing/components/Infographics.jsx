import { Box, Text, Group, Stack, SimpleGrid, Container, Title, Badge } from "@mantine/core";
import {
  IconCalendar,
  IconFileInvoice,
  IconCash,
  IconReportAnalytics,
  IconUsers,
  IconClipboardCheck,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons";

/* ─── colour tokens ─── */
const C = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  amber: "#f59e0b",
  emerald: "#10b981",
  rose: "#f43f5e",
  slate: "#64748b",
};

/* ================================================================
   1. DASHBOARD MOCKUP  –  CSS-only "app screenshot" illustration
   ================================================================ */
export const DashboardMockup = () => (
  <Box
    style={{
      perspective: "1200px",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <Box
      className="landing-float-slow"
      style={{
        width: "100%",
        maxWidth: 560,
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        borderRadius: 16,
        padding: 3,
        boxShadow: "0 25px 60px rgba(99,102,241,0.35), 0 8px 20px rgba(0,0,0,0.25)",
        transform: "rotateY(-4deg) rotateX(2deg)",
        transformStyle: "preserve-3d",
      }}
    >
      <Box style={{ background: "#0f172a", borderRadius: 14, overflow: "hidden" }}>
        {/* Title bar */}
        <Box style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #1e293b" }}>
          <Box style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
          <Box style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
          <Box style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
          <Box style={{ flex: 1, height: 22, borderRadius: 6, background: "#1e293b", marginLeft: 12 }} />
        </Box>

        {/* Content */}
        <Box style={{ display: "flex", minHeight: 300 }}>
          {/* Sidebar */}
          <Box style={{ width: 52, background: "#1e293b", padding: "16px 8px", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            {[C.indigo, C.cyan, C.violet, C.amber, C.emerald, C.slate].map((c, i) => (
              <Box key={i} style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? c : `${c}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box style={{ width: 12, height: 12, borderRadius: 3, background: i === 0 ? "white" : c, opacity: i === 0 ? 1 : 0.6 }} />
              </Box>
            ))}
          </Box>

          {/* Main area */}
          <Box style={{ flex: 1, padding: 16 }}>
            {/* KPI cards row */}
            <Box style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Tasks", value: "248", color: C.indigo, change: "+12%" },
                { label: "Clients", value: "86", color: C.cyan, change: "+5%" },
                { label: "Revenue", value: "$24.5k", color: C.emerald, change: "+18%" },
                { label: "Staff", value: "32", color: C.violet, change: "+3" },
              ].map((kpi) => (
                <Box key={kpi.label} style={{ flex: 1, background: "#1e293b", borderRadius: 10, padding: "10px 12px", borderLeft: `3px solid ${kpi.color}` }}>
                  <Text size={9} style={{ color: "#94a3b8", marginBottom: 2 }}>{kpi.label}</Text>
                  <Text size="sm" fw={800} style={{ color: "white", lineHeight: 1.2 }}>{kpi.value}</Text>
                  <Text size={8} style={{ color: C.emerald }}>{kpi.change}</Text>
                </Box>
              ))}
            </Box>

            {/* Chart area */}
            <Box style={{ display: "flex", gap: 10 }}>
              {/* Bar chart */}
              <Box style={{ flex: 2, background: "#1e293b", borderRadius: 10, padding: 12 }}>
                <Text size={9} fw={600} style={{ color: "#94a3b8", marginBottom: 10 }}>Task Overview</Text>
                <Box style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
                  {[65, 45, 80, 55, 90, 70, 85, 40, 75, 60, 95, 50].map((h, i) => (
                    <Box
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        borderRadius: "3px 3px 0 0",
                        background: i % 3 === 0 ? C.indigo : i % 3 === 1 ? C.violet : C.cyan,
                        opacity: 0.8,
                        transition: "height 0.5s ease",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Donut chart */}
              <Box style={{ flex: 1, background: "#1e293b", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Text size={9} fw={600} style={{ color: "#94a3b8", marginBottom: 8 }}>Status</Text>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke={C.indigo} strokeWidth="8" strokeDasharray="113 188" strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke={C.cyan} strokeWidth="8" strokeDasharray="50 188" strokeDashoffset="-113" strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke={C.amber} strokeWidth="8" strokeDasharray="25 188" strokeDashoffset="-163" strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <text x="40" y="43" textAnchor="middle" fill="white" fontSize="14" fontWeight="800">86%</text>
                </svg>
                <Box style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {[{ c: C.indigo, l: "Done" }, { c: C.cyan, l: "Active" }, { c: C.amber, l: "Pending" }].map(({ c, l }) => (
                    <Box key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Box style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                      <Text size={7} style={{ color: "#94a3b8" }}>{l}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Table preview */}
            <Box style={{ background: "#1e293b", borderRadius: 10, padding: 12, marginTop: 10 }}>
              <Text size={9} fw={600} style={{ color: "#94a3b8", marginBottom: 8 }}>Recent Tasks</Text>
              {[
                { id: "T-1042", client: "Sarah M.", provider: "James K.", status: "Completed", sColor: C.emerald },
                { id: "T-1041", client: "Robert L.", provider: "Emily R.", status: "In Progress", sColor: C.indigo },
                { id: "T-1040", client: "Maria G.", provider: "David S.", status: "Scheduled", sColor: C.amber },
              ].map((row) => (
                <Box key={row.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #0f172a" }}>
                  <Text size={8} fw={600} style={{ color: C.indigo, width: 48 }}>{row.id}</Text>
                  <Text size={8} style={{ color: "#cbd5e1", flex: 1 }}>{row.client}</Text>
                  <Text size={8} style={{ color: "#94a3b8", flex: 1 }}>{row.provider}</Text>
                  <Box style={{ background: `${row.sColor}20`, padding: "2px 8px", borderRadius: 4 }}>
                    <Text size={7} fw={600} style={{ color: row.sColor }}>{row.status}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

/* ================================================================
   2. HOW IT WORKS  –  Numbered step flow with connecting line
   ================================================================ */
const WORKFLOW_STEPS = [
  {
    step: 1,
    icon: IconUsers,
    title: "Set Up Your Team",
    desc: "Add your clients, caregivers, and staff with profiles, documents, and availability.",
    color: C.indigo,
  },
  {
    step: 2,
    icon: IconCalendar,
    title: "Schedule & Assign",
    desc: "Create bookings, assign caregivers, and manage schedules with drag-and-drop ease.",
    color: C.cyan,
  },
  {
    step: 3,
    icon: IconClipboardCheck,
    title: "Track & Confirm",
    desc: "Caregivers check in/out in real time. Confirm completed tasks for billing.",
    color: C.violet,
  },
  {
    step: 4,
    icon: IconFileInvoice,
    title: "Bill & Pay",
    desc: "Auto-generate invoices and payroll. Integrated Stripe payments for seamless processing.",
    color: C.amber,
  },
  {
    step: 5,
    icon: IconReportAnalytics,
    title: "Analyse & Grow",
    desc: "Real-time dashboards and exportable reports to make data-driven decisions.",
    color: C.emerald,
  },
];

export const HowItWorks = () => (
  <Box
    style={{
      padding: "5rem 0",
      background: "linear-gradient(180deg, #faf5ff 0%, #eef2ff 50%, #f0f9ff 100%)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Decorative */}
    <Box className="landing-pulse" style={{ position: "absolute", top: "-10%", left: "-5%", width: "25%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

    <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
      <Stack align="center" spacing="md" mb={56}>
        <Badge size="lg" variant="gradient" gradient={{ from: C.indigo, to: C.violet }} radius="xl" styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}>
          How It Works
        </Badge>
        <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
          Five Steps to{" "}
          <span className="landing-gradient-text">Streamlined Care</span>
        </Title>
        <Text size="lg" c="dimmed" ta="center" maw={600}>
          From setup to insights — here's how CareSyncX transforms your operations.
        </Text>
      </Stack>

      {/* Steps */}
      <Box style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
        {/* Connecting vertical line */}
        <Box
          style={{
            position: "absolute",
            left: 32,
            top: 40,
            bottom: 40,
            width: 3,
            background: `linear-gradient(180deg, ${C.indigo} 0%, ${C.cyan} 25%, ${C.violet} 50%, ${C.amber} 75%, ${C.emerald} 100%)`,
            borderRadius: 2,
            opacity: 0.3,
          }}
        />

        <Stack spacing={0}>
          {WORKFLOW_STEPS.map(({ step, icon: Icon, title, desc, color }, idx) => (
            <Box
              key={step}
              className="landing-card-hover"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                padding: "24px 0",
                cursor: "default",
              }}
            >
              {/* Step number circle */}
              <Box
                style={{
                  width: 64,
                  height: 64,
                  minWidth: 64,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 20px ${color}40`,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <Text fw={900} size="lg" style={{ color: "white" }}>{step}</Text>
              </Box>

              {/* Content card */}
              <Box
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 16,
                  padding: "20px 24px",
                  border: `1px solid ${color}15`,
                  borderLeft: `4px solid ${color}`,
                  boxShadow: `0 2px 12px ${color}08`,
                }}
              >
                <Group spacing="sm" mb={6}>
                  <Icon size={22} color={color} />
                  <Title order={4} fw={700} style={{ color: "#1e293b" }}>{title}</Title>
                </Group>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>{desc}</Text>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Container>
  </Box>
);

/* ================================================================
   3. STATS RINGS  –  Circular progress-ring infographic
   ================================================================ */
const RING_DATA = [
  { label: "Client Satisfaction", value: 97, color: C.emerald, suffix: "%" },
  { label: "Task Completion", value: 94, color: C.indigo, suffix: "%" },
  { label: "On-Time Arrivals", value: 91, color: C.cyan, suffix: "%" },
  { label: "Billing Accuracy", value: 99, color: C.violet, suffix: "%" },
];

const ProgressRing = ({ value, color, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${color}15`} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.5s ease" }}
      />
    </svg>
  );
};

export const StatsRings = () => (
  <Box
    style={{
      padding: "4rem 0",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box className="landing-dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.2, pointerEvents: "none" }} />
    <Box className="landing-float" style={{ position: "absolute", top: "10%", right: "5%", width: 120, height: 120, borderRadius: "50%", border: `2px solid ${C.indigo}30`, pointerEvents: "none" }} />

    <Container size="xl" style={{ position: "relative", zIndex: 1 }}>
      <Stack align="center" spacing="md" mb={40}>
        <Badge size="lg" variant="gradient" gradient={{ from: C.indigo, to: C.violet }} radius="xl" styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}>
          Performance Metrics
        </Badge>
        <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "white" }}>
          Built for{" "}
          <span className="landing-gradient-text">Excellence</span>
        </Title>
      </Stack>

      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "sm", cols: 1 },
        ]}
        spacing="xl"
      >
        {RING_DATA.map(({ label, value, color, suffix }) => (
          <Stack key={label} align="center" spacing="sm">
            <Box style={{ position: "relative", width: 120, height: 120 }}>
              <ProgressRing value={value} color={color} />
              <Box
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text fw={900} size="xl" style={{ color: "white" }}>
                  {value}{suffix}
                </Text>
              </Box>
            </Box>
            <Text fw={600} size="sm" ta="center" style={{ color: "rgba(255,255,255,0.85)" }}>
              {label}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </Container>
  </Box>
);

/* ================================================================
   4. FEATURE SHOWCASE  –  Alternating left/right large cards
   ================================================================ */
const SHOWCASE_FEATURES = [
  {
    icon: IconCalendar,
    title: "Smart Scheduling",
    subtitle: "Plan with confidence",
    desc: "Drag-and-drop scheduling with intelligent caregiver matching. Assign tasks based on availability, location, and client preferences. Real-time updates keep everyone in sync.",
    highlights: ["Drag & drop planning", "Auto caregiver matching", "Real-time notifications", "Conflict detection"],
    color: C.indigo,
    gradient: `linear-gradient(135deg, ${C.indigo} 0%, ${C.violet} 100%)`,
  },
  {
    icon: IconCash,
    title: "Billing & Payroll",
    subtitle: "Financial clarity",
    desc: "Automatically generate client invoices and caregiver wages from confirmed tasks. Integrated with Stripe for seamless payment processing. No more spreadsheet chaos.",
    highlights: ["Auto invoice generation", "Stripe integration", "Wage calculations", "Payment tracking"],
    color: C.cyan,
    gradient: `linear-gradient(135deg, ${C.cyan} 0%, ${C.indigo} 100%)`,
  },
  {
    icon: IconReportAnalytics,
    title: "Advanced Reporting",
    subtitle: "Data-driven decisions",
    desc: "Comprehensive dashboards showing billing trends, task summaries, attendance patterns, and performance metrics. Export reports as PDF for stakeholders.",
    highlights: ["Real-time dashboards", "Billing & payroll reports", "Attendance analytics", "PDF export"],
    color: C.violet,
    gradient: `linear-gradient(135deg, ${C.violet} 0%, ${C.amber} 100%)`,
  },
];

export const FeatureShowcase = () => (
  <Box style={{ padding: "5rem 0", background: "linear-gradient(180deg, #f0f9ff 0%, #faf5ff 100%)" }}>
    <Container size="xl">
      <Stack align="center" spacing="md" mb={56}>
        <Badge size="lg" variant="light" color="violet" radius="xl" styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}>
          Feature Spotlight
        </Badge>
        <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
          Powerful Tools,{" "}
          <span className="landing-gradient-text">Simple Experience</span>
        </Title>
        <Text size="lg" c="dimmed" ta="center" maw={640}>
          Each feature is designed to eliminate complexity and give you back time for what matters — care.
        </Text>
      </Stack>

      <Stack spacing={48}>
        {SHOWCASE_FEATURES.map(({ icon: Icon, title, subtitle, desc, highlights, color, gradient }, idx) => (
          <Box
            key={title}
            className="landing-card-hover"
            style={{
              display: "flex",
              flexDirection: idx % 2 === 0 ? "row" : "row-reverse",
              gap: 40,
              alignItems: "center",
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
              borderRadius: 24,
              padding: 32,
              border: `1px solid ${color}12`,
              boxShadow: `0 4px 24px ${color}08`,
              flexWrap: "wrap",
            }}
          >
            {/* Visual / Icon area */}
            <Box style={{ flex: "1 1 280px", display: "flex", justifyContent: "center" }}>
              <Box
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 28,
                  background: gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: `0 12px 40px ${color}30`,
                }}
              >
                {/* Decorative ring */}
                <Box
                  className="landing-spin-slow"
                  style={{
                    position: "absolute",
                    inset: -16,
                    borderRadius: 36,
                    border: `2px dashed ${color}30`,
                    pointerEvents: "none",
                  }}
                />
                <Icon size={80} color="white" stroke={1.5} />
              </Box>
            </Box>

            {/* Text area */}
            <Box style={{ flex: "2 1 340px" }}>
              <Text size="xs" fw={700} style={{ color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                {subtitle}
              </Text>
              <Title order={3} fw={800} mb="sm" style={{ fontSize: 28 }}>{title}</Title>
              <Text size="md" c="dimmed" style={{ lineHeight: 1.8, marginBottom: 20 }}>
                {desc}
              </Text>
              <SimpleGrid cols={2} spacing="xs" breakpoints={[{ maxWidth: "xs", cols: 1 }]}>
                {highlights.map((h) => (
                  <Group key={h} spacing={8} noWrap>
                    <Box style={{ width: 22, height: 22, borderRadius: 6, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IconCheck size={13} color={color} />
                    </Box>
                    <Text size="sm" fw={500} style={{ color: "#475569" }}>{h}</Text>
                  </Group>
                ))}
              </SimpleGrid>
            </Box>
          </Box>
        ))}
      </Stack>
    </Container>
  </Box>
);

/* ================================================================
   5. PLATFORM COMPARISON  –  Before / After visual
   ================================================================ */
export const BeforeAfter = () => {
  const items = [
    { before: "Manual spreadsheets", after: "Automated scheduling" },
    { before: "Paper invoices", after: "One-click billing" },
    { before: "Phone call check-ins", after: "Real-time attendance" },
    { before: "Guessing staff availability", after: "Smart caregiver matching" },
    { before: "Monthly manual reports", after: "Live dashboards & analytics" },
    { before: "Scattered data", after: "Everything in one platform" },
  ];

  return (
    <Box style={{ padding: "5rem 0", background: "white" }}>
      <Container size="lg">
        <Stack align="center" spacing="md" mb={48}>
          <Badge size="lg" variant="gradient" gradient={{ from: C.indigo, to: C.violet }} radius="xl" styles={{ root: { padding: "10px 20px", textTransform: "none", fontSize: 13, fontWeight: 600 } }}>
            Why CareSyncX
          </Badge>
          <Title order={2} ta="center" fw={800} style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
            From Chaos to{" "}
            <span className="landing-gradient-text">Clarity</span>
          </Title>
        </Stack>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 0,
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {/* Header row */}
          <Box style={{ padding: "12px 20px", background: "#fee2e2", borderRadius: "12px 0 0 0" }}>
            <Text fw={700} ta="center" size="sm" style={{ color: C.rose }}>Without CareSyncX</Text>
          </Box>
          <Box style={{ width: 48 }} />
          <Box style={{ padding: "12px 20px", background: `${C.emerald}15`, borderRadius: "0 12px 0 0" }}>
            <Text fw={700} ta="center" size="sm" style={{ color: C.emerald }}>With CareSyncX</Text>
          </Box>

          {items.map(({ before, after }, idx) => (
            <Box key={idx} style={{ display: "contents" }}>
              <Box style={{ padding: "14px 20px", background: idx % 2 === 0 ? "#fff5f5" : "#fef2f2", display: "flex", alignItems: "center", borderBottom: idx === items.length - 1 ? "none" : "1px solid #fecaca" }}>
                <Text size="sm" c="dimmed" style={{ textDecoration: "line-through", opacity: 0.7 }}>{before}</Text>
              </Box>
              <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48 }}>
                <IconArrowRight size={18} color={C.indigo} />
              </Box>
              <Box style={{ padding: "14px 20px", background: idx % 2 === 0 ? `${C.emerald}08` : `${C.emerald}05`, display: "flex", alignItems: "center", gap: 8, borderBottom: idx === items.length - 1 ? "none" : `1px solid ${C.emerald}15` }}>
                <IconCheck size={16} color={C.emerald} />
                <Text size="sm" fw={600} style={{ color: "#1e293b" }}>{after}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
