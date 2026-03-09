import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
} from '@react-pdf/renderer'
import type { WizardData } from '../../types/wizard'
import type { GeneratedFile } from '../engine'

// --- Styles ---

const navy = '#0A1628'
const accent = '#FF6B35'
const textSecondary = '#64748B'
const codeBg = '#F1F5F9'

const s = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: navy,
    lineHeight: 1.6,
  },
  coverPage: {
    paddingTop: 120,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 32,
    borderRadius: 8,
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: navy,
    textAlign: 'center',
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 12,
    color: textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  coverFooter: {
    fontSize: 9,
    color: textSecondary,
    textAlign: 'center',
    marginTop: 80,
  },
  h1: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: navy,
    marginBottom: 12,
    marginTop: 4,
    borderBottomWidth: 2,
    borderBottomColor: accent,
    paddingBottom: 6,
  },
  h2: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: navy,
    marginBottom: 8,
    marginTop: 16,
  },
  p: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 1.6,
  },
  pSmall: {
    fontSize: 9,
    color: textSecondary,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  link: {
    color: accent,
    textDecoration: 'underline',
  },
  codeBlock: {
    backgroundColor: codeBg,
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    fontFamily: 'Courier',
    fontSize: 9,
    lineHeight: 1.5,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bullet: {
    width: 14,
    fontSize: 10,
    color: accent,
  },
  listText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.6,
  },
  checkItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4,
  },
  check: {
    width: 16,
    fontSize: 10,
    color: accent,
    fontFamily: 'Helvetica-Bold',
  },
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4,
  },
  numberLabel: {
    width: 20,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: accent,
  },
  fileRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  fileName: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: navy,
    width: '45%',
    backgroundColor: codeBg,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  fileDesc: {
    fontSize: 9,
    color: textSecondary,
    paddingLeft: 8,
    flex: 1,
  },
  promptBlock: {
    backgroundColor: codeBg,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: accent,
    padding: 10,
    marginBottom: 8,
    fontFamily: 'Courier',
    fontSize: 9,
    lineHeight: 1.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginVertical: 16,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 24,
    right: 48,
    fontSize: 8,
    color: textSecondary,
  },
})

// --- Helpers ---

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.listItem}>
      <Text style={s.bullet}>•</Text>
      <Text style={s.listText}>{children}</Text>
    </View>
  )
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.checkItem}>
      <Text style={s.check}>✓</Text>
      <Text style={s.listText}>{children}</Text>
    </View>
  )
}

function NumberedStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <View style={s.numberedItem}>
      <Text style={s.numberLabel}>{n}.</Text>
      <Text style={s.listText}>{children}</Text>
    </View>
  )
}

function FileRow({ name, desc }: { name: string; desc: string }) {
  return (
    <View style={s.fileRow}>
      <Text style={s.fileName}>{name}</Text>
      <Text style={s.fileDesc}>{desc}</Text>
    </View>
  )
}

function PageNum() {
  return (
    <Text
      style={s.pageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  )
}

// --- Capability descriptions ---

const capDescriptions: Record<string, string> = {
  context7:
    'Live Documentation — Claude Code automatically checks the latest official docs for libraries and frameworks you use, so it never gives outdated advice.',
  perplexity:
    'Web Research — Claude Code can search the internet during coding sessions to find solutions, check documentation, and verify approaches.',
  playwright:
    'Browser Testing — Claude Code can open a real browser to see what your website looks like and verify visual changes.',
  postgres:
    'Database Access — Claude Code can query your database directly to verify that code changes work correctly with real data.',
  shell:
    'Server Access — Claude Code can connect to your server to check health, read logs, and deploy code remotely.',
}

// --- File descriptions for the structure section ---

const allFileDescriptions: Record<string, string> = {
  'CLAUDE.md': 'Your project brief — Claude Code reads this every session',
  '.claude/settings.json': 'Permissions, safety checks, and quality hooks',
  'docs/development-queue.md': 'Your task list with goals and next steps',
  'docs/philosophy.md': 'Design principles and what to avoid',
  'docs/feature-inventory.md': 'Tracks what has been built',
  'docs/handoff-log.md': 'Session notes — remembers what happened between sessions',
  '.gitignore': 'Keeps sensitive files out of version control',
  '.mcp.json': 'AI tool connections (documentation, web search, etc.)',
  '.claude/hooks/session-start.sh': 'Loads context at the start of each session',
  '.claude/hooks/pre-commit-check.sh': 'Runs tests before saving code',
  '.claude/hooks/pre-bash-firewall.sh': 'Blocks dangerous terminal commands',
  '.claude/rules/schema.md': 'Database rules — read schema before queries',
  'Claude Code Prompt Advisor.txt': 'Paste into any AI for help writing prompts',
  'Setup/1 - Setup Prerequisites.bat': 'Install Node.js, Git, and Claude Code',
  'Setup/1 - Setup Prerequisites.command': 'Install Node.js, Git, and Claude Code',
  'Setup/2 - Setup Credentials.bat': 'Configure AI tool API keys',
  'Setup/2 - Setup Credentials.command': 'Configure AI tool API keys',
  'Start Claude Code.bat': 'Launch Claude Code in your project',
  'Start Claude Code.command': 'Launch Claude Code in your project',
  'Start Claude Code (Full Permissions).bat': 'Launch with all permissions enabled',
  'Start Claude Code (Full Permissions).command': 'Launch with all permissions enabled',
  'Start Plan Mode.bat': 'Launch in planning mode — analyze before acting',
  'Start Plan Mode.command': 'Launch in planning mode — analyze before acting',
  'Check Costs.bat': 'Check your Claude Code usage costs',
  'Check Costs.command': 'Check your Claude Code usage costs',
}

function getFileDescriptions(files: GeneratedFile[]): { name: string; desc: string }[] {
  const result = files.map(f => {
    const shortName = f.name.includes('/') ? f.name.substring(f.name.indexOf('/') + 1) : f.name
    return { name: shortName, desc: allFileDescriptions[shortName] || '' }
  }).filter(f => f.desc)

  // Add the PDF itself
  result.push({ name: 'Setup/0 - READ ME FIRST.pdf', desc: 'This guide' })

  return result
}

// --- Document ---

interface GuideProps {
  data: WizardData
  files: GeneratedFile[]
  logoBase64: string
}

export function GettingStartedGuide({ data, files, logoBase64 }: GuideProps) {
  const projectName = data.project_name || 'Your Project'
  const fileDescs = getFileDescriptions(files)
  const selectedCaps = ['context7', ...data.capabilities.filter(c => c !== 'context7')]
  const needsCredentials = data.capabilities.some(c => ['perplexity', 'postgres', 'shell'].includes(c))

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={s.coverPage}>
        <PageNum />
        {logoBase64 && <Image style={s.logo} src={logoBase64} />}
        <Text style={s.coverTitle}>Getting Started with{'\n'}{projectName}</Text>
        <Text style={s.coverSubtitle}>Your AI-assisted development environment is ready.</Text>
        <Text style={s.coverSubtitle}>Follow this guide to set up and start building.</Text>
        <Text style={s.coverFooter}>Generated by Praton Launchpad</Text>
      </Page>

      {/* What is Claude Code? */}
      <Page size="A4" style={s.page}>
        <PageNum />
        <Text style={s.h1}>What is Claude Code?</Text>
        <Text style={s.p}>
          Claude Code is an AI coding assistant made by Anthropic that runs directly in your terminal. You describe what you want to build in plain English, and it writes the code, runs tests, and makes changes to your project files.
        </Text>
        <Text style={s.p}>
          Think of it as a senior developer sitting next to you — it can read your entire project, understand context from previous sessions, and work through tasks step by step. Your project has been configured so Claude Code knows exactly how to work on it.
        </Text>

        <View style={s.divider} />

        {/* Prerequisites */}
        <Text style={s.h1}>Setup Prerequisites</Text>
        <Text style={s.p}>
          Double-click "Setup Prerequisites" to get started. The script installs everything automatically.
        </Text>
        <Text style={s.p}>The script will:</Text>
        <Check>Check for Node.js — and open the download page if it's missing</Check>
        <Check>Check for Git — and open the download page if it's missing</Check>
        <Check>Install Claude Code automatically using npm</Check>
        <Check>Log you into Claude Code via your browser</Check>

        <Text style={[s.p, { marginTop: 8 }] as const}>
          If you prefer to install manually, here's what you need:
        </Text>
        <Bullet>
          <Text><Text style={s.bold}>Node.js</Text> — <Link style={s.link} src="https://nodejs.org">nodejs.org</Link> (LTS version)</Text>
        </Bullet>
        <Bullet>
          <Text><Text style={s.bold}>Git</Text> — <Link style={s.link} src="https://git-scm.com/downloads">git-scm.com/downloads</Link></Text>
        </Bullet>
        <Bullet>
          <Text><Text style={s.bold}>Claude Code</Text> — run: </Text>
        </Bullet>
        <View style={s.codeBlock}><Text>npm install -g @anthropic-ai/claude-code</Text></View>
      </Page>

      {/* Project Structure */}
      <Page size="A4" style={s.page}>
        <PageNum />
        <Text style={s.h1}>Your Project Structure</Text>
        <Text style={s.p}>
          Here's every file in your project and what it does:
        </Text>
        {fileDescs.map((f, i) => (
          <FileRow key={i} name={f.name} desc={f.desc} />
        ))}

        <View style={s.divider} />

        {/* How to Start */}
        <Text style={s.h1}>How to Start</Text>
        <Text style={s.h2}>Quick Start</Text>
        <NumberedStep n={1}>Unzip the downloaded folder</NumberedStep>
        <NumberedStep n={2}>Double-click "Setup Prerequisites" — this installs everything you need</NumberedStep>
        {needsCredentials && (
          <NumberedStep n={3}>Double-click "Setup Credentials" — this connects your AI tools</NumberedStep>
        )}
        <NumberedStep n={needsCredentials ? 4 : 3}>Double-click "Start Claude Code" — and start building</NumberedStep>

        {needsCredentials && (
          <>
            <View style={s.divider} />
            <Text style={s.h1}>Configure Your AI Tools</Text>
            <Text style={s.p}>
              Some of your AI tools need credentials (API keys or connection strings) before they can work.
            </Text>
            <Check>Double-click "Setup Credentials" (the .bat file on Windows, .command on macOS)</Check>
            <Check>Follow the prompts — it will tell you what each key is and where to get it</Check>
            <Check>Paste each key when asked</Check>
            <Text style={s.pSmall}>
              You can run this script again anytime if you need to update your credentials.
            </Text>
          </>
        )}

        <View style={s.divider} />

        <Text style={s.h2}>Other Ways to Start</Text>
        <Bullet>
          <Text><Text style={s.bold}>Start Claude Code (Full Permissions)</Text> — Skips permission prompts. Use this once you're comfortable and trust Claude Code with your project.</Text>
        </Bullet>
        <Bullet>
          <Text><Text style={s.bold}>Start Plan Mode</Text> — Claude Code analyzes your project and proposes a plan before making any changes. Great for reviewing what it will do first.</Text>
        </Bullet>
        <Bullet>
          <Text><Text style={s.bold}>Check Costs</Text> — Shows how much you've spent on Claude Code API usage.</Text>
        </Bullet>
      </Page>

      {/* Useful Prompts */}
      <Page size="A4" style={s.page}>
        <PageNum />
        <Text style={s.h1}>Useful Prompts</Text>
        <Text style={s.p}>Copy and paste these into Claude Code to get started:</Text>

        <Text style={s.h2}>Start your first task</Text>
        <View style={s.promptBlock}>
          <Text>Read CLAUDE.md and start working on the first pending task in docs/development-queue.md</Text>
        </View>

        <Text style={s.h2}>Run diagnostics on a problem</Text>
        <View style={s.promptBlock}>
          <Text>ultrathink — use plan mode. Do not make any changes until you present a diagnosis. Audit [describe the problem] end-to-end. Present root cause.</Text>
        </View>
        <Text style={s.pSmall}>Example:</Text>
        <View style={s.promptBlock}>
          <Text>ultrathink — use plan mode. The login page shows a blank screen after submitting the form. Trace the login flow end-to-end. Present root cause.</Text>
        </View>

        <Text style={s.h2}>Check project status</Text>
        <View style={s.promptBlock}>
          <Text>What is the current state of the project? Summarize what's built, what's in progress, and what's next.</Text>
        </View>

        <Text style={s.h2}>Add a new task</Text>
        <View style={s.promptBlock}>
          <Text>Add a new task to docs/development-queue.md: [describe what you want to build]. Set priority to Medium.</Text>
        </View>

        <Text style={s.h2}>Continue from last session</Text>
        <View style={s.promptBlock}>
          <Text>Read CLAUDE.md and docs/handoff-log.md. Continue from where the last session left off.</Text>
        </View>

        <Text style={s.h2}>Run all tests</Text>
        <View style={s.promptBlock}>
          <Text>Run all tests and report the results. If anything fails, diagnose the root cause.</Text>
        </View>
      </Page>

      {/* How Claude Code Works For You */}
      <Page size="A4" style={s.page}>
        <PageNum />
        <Text style={s.h1}>How Claude Code Works For You</Text>
        <Text style={s.p}>
          Your project includes automatic quality checks that run in the background. You don't need to do anything — they just work.
        </Text>

        <Bullet>
          <Text><Text style={s.bold}>Session startup</Text> — Every time you open Claude Code, it automatically loads your project context, checks for uncommitted changes, and reads notes from the last session.</Text>
        </Bullet>
        <Bullet>
          <Text><Text style={s.bold}>Test enforcement</Text> — When Claude Code saves code (commits), it automatically runs your tests first. If tests fail, it fixes them before saving.</Text>
        </Bullet>
        <Bullet>
          <Text><Text style={s.bold}>Safety checks</Text> — Dangerous commands (like deleting everything or force-pushing code) are automatically blocked. Claude Code uses safer alternatives instead.</Text>
        </Bullet>
        <Bullet>
          <Text><Text style={s.bold}>Session notes</Text> — Claude Code automatically writes notes about what it did, what works, and what's next. This means it remembers context between sessions.</Text>
        </Bullet>
        <Bullet>
          <Text><Text style={s.bold}>Feature tracking</Text> — As features are built, they're tracked in a feature inventory so you always know what's done and what's pending.</Text>
        </Bullet>

        <View style={s.divider} />

        {/* AI Tools */}
        <Text style={s.h1}>Your AI Tools</Text>
        <Text style={s.p}>
          These tools are connected and ready to use in your project:
        </Text>
        {selectedCaps.map((cap) => (
          capDescriptions[cap] ? (
            <Bullet key={cap}>
              <Text>{capDescriptions[cap]}</Text>
            </Bullet>
          ) : null
        ))}

        <View style={s.divider} />

        {/* Getting Help */}
        <Text style={s.h1}>Getting Help</Text>
        <Bullet>
          <Text>
            <Text style={s.bold}>Claude Code documentation: </Text>
            <Link style={s.link} src="https://docs.anthropic.com/en/docs/claude-code">docs.anthropic.com/en/docs/claude-code</Link>
          </Text>
        </Bullet>
        <Bullet>
          <Text>
            <Text style={s.bold}>Prompt writing guide: </Text>
            See "Claude Code Prompt Advisor.txt" in your project folder. Paste it into any AI to get help writing effective prompts.
          </Text>
        </Bullet>
        <View style={{ marginTop: 32, alignItems: 'center' } as const}>
          <Text style={{ fontSize: 9, color: textSecondary, textAlign: 'center' } as const}>
            Generated by Praton Launchpad — praton.com
          </Text>
        </View>
      </Page>
    </Document>
  )
}
