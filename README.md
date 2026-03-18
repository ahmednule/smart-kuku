# KukuSmart | Autonomous Poultry Farm Decision Agent

MKU AI Hackathon 2025 - School of Computing and Informatics

KukuSmart is an AI-powered autonomous decision-making system for smallholder poultry farmers in Kenya. It continuously monitors flock health, feed and water levels, egg production, and environmental conditions, then decides and recommends what to do next with clear reasoning.

## Snapshot

- 7M+ smallholder farmers
- 15-30% average flock loss per cycle
- KES 4B+ estimated annual revenue lost
- Under 60s AI response loop

## 1. Overview

KukuSmart is designed to protect birds and maximize farm revenue through a continuous autonomous cycle:

Perceive -> Reason -> Act -> Explain

The platform is built around a modern full-stack approach:

- Frontend: React + Apollo Client
- Backend API: Node.js + Apollo Server + GraphQL
- Data: PostgreSQL
- AI agent layer for decision support and explanations

## 2. The Problem

Smallholder poultry farmers face repeated avoidable losses due to:

- Late detection of disease outbreaks (for example Newcastle, Gumboro, Coccidiosis)
- Water shortages that trigger heat stress quickly, especially in high temperatures
- Feed mismanagement that silently reduces margins
- Poor sale timing based on urgent cash needs instead of data
- Low or no farm data capture for historical planning

The challenge is not farmer commitment. The challenge is missing continuous monitoring and timely decision support.

## 3. The Solution

KukuSmart runs an autonomous agent cycle whenever new metrics are logged or critical thresholds are breached.

- Perceive: Collect current farm metrics, trends, and unresolved alerts
- Reason: Analyze patterns and identify the single most urgent issue
- Act: Generate the highest-priority action (health alert, water/feed action, sale timing suggestion)
- Explain: Save and display plain-language reasoning in the dashboard

Auto-triggered response is expected on critical events such as:

- Water levels below safe threshold
- High house temperature
- Mortality above expected percentage

## 4. Key Features

- Autonomous agent cycle that can run without manual prompting
- Real-time GraphQL subscriptions for live alert updates
- Voice input support (English - Kenya) for quick field logging
- Multi-flock support for layers and broilers on one farm
- Decision audit trail for transparency and accountability
- Data-driven sale timing support
- Auto-threshold triggers for urgent risk conditions

## 5. Technology Stack

| Layer | Component | Technology |
| --- | --- | --- |
| Frontend | Web app | React 18 + Apollo Client |
| API | GraphQL server | Node.js + Apollo Server 4 |
| Database | Persistent storage | PostgreSQL + Prisma |
| Real-time | Event updates | GraphQL Subscriptions (WebSocket) |
| Voice | Input mode | Web Speech API (English - Kenya) |

## 6. Target Users

- Smallholder poultry farmers (50-2,000 birds)
- Agricultural extension officers managing multiple farms
- Poultry cooperative managers monitoring member farm performance

## 7. Expected Impact

For a typical 500-bird layer farm, KukuSmart aims to support:

- 20-30% reduction in flock mortality via earlier risk detection
- 10-15% improvement in feed efficiency
- 8-12% revenue improvement through smarter sale timing
- Better farm records for planning, financing, and reporting

## 8. Autonomous Systems Track Fit

KukuSmart fits the Autonomous Systems track by operating independently with minimal human input. It perceives farm state, reasons over risk, and proposes actions with explanations.

## 9. Team and Event

Built at MKU AI Hackathon - March 18-19, 2025

- School of Computing and Informatics, Mount Kenya University
- Google Developer Group - Mount Kenya University Chapter

KukuSmart moves poultry farming from reactive to proactive decision-making.

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Open http://localhost:3000 in your browser.