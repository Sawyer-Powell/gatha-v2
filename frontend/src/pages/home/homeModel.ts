import { formatClockTime } from "$lib/utils/time";

export type VideoStatus =
  | "uploading"
  | "uploadFailed"
  | "uploaded"
  | "configuring"
  | "queued"
  | "transcribing"
  | "transcriptionFailed"
  | "ready";

export interface VideoItem {
  id: string;
  title: string;
  date: string;
  src: string;
  status: VideoStatus;
  uploadProgress: number;
  transcriptionProgress: number;
  prompt: string;
  emailOnComplete: boolean;
  uploadedByEmail: string;
  transcribedByEmail?: string;
  transcribedAt?: string;
  estimatedTranscriptionCost?: string;
}

export type AccountTab = "profile" | "organization" | "billing" | "contribute";
export type BillingTab = "transcriptions" | "transactions";
export type AccountRole = "admin" | "member";

export interface OrgMember {
  name: string;
  email: string;
  role: AccountRole;
  current?: boolean;
}

const sampleSrc = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const promptPresets = [
  "General clean transcript",
  "Sutra study notes",
  "Speaker labels and timestamps",
];

export const statusCopy: Record<VideoStatus, string> = {
  uploading: "Uploading",
  uploadFailed: "Upload failed",
  uploaded: "Ready to transcribe",
  configuring: "Prompt",
  queued: "Queued",
  transcribing: "Transcribing",
  transcriptionFailed: "Transcription failed",
  ready: "Ready",
};

export const user = {
  email: "sawyerhpowell@gmail.com",
  role: "admin" as AccountRole,
};

export const organization = {
  logo: "UZ",
  members: [
    { name: "Sawyer Powell", email: "sawyerhpowell@gmail.com", role: "admin", current: true },
    { name: "Jiayin Liu", email: "liujiayina@gmail.com", role: "member" },
  ] satisfies OrgMember[],
};

export const billing = {
  predicted: "$184.20",
  actual: "$250.00",
  transcriptions: [
    ["diamond_sutra_292387.mp4", "Sawyer Powell", "$4.82"],
    ["morning_talk_uploaded.mp4", "Jiayin Liu", "$2.16"],
    ["running_transcript.mp4", "Sawyer Powell", "$7.44"],
  ],
  transactions: [
    ["Jun 20", "Contribution", "Sawyer Powell", "+$250.00"],
    ["Jun 21", "GCP Gemini API", "Platform billing", "-$65.80"],
    ["Jun 21", "GCP Cloud Storage", "Platform billing", "-$0.42"],
  ],
};

export const GEMINI_TRANSCRIPTION_COST_PER_MINUTE = 2 / 60;

export const initialVideos: VideoItem[] = [
  {
    id: "diamond-sutra-1",
    title: "diamond_sutra_292387.mp4",
    date: "Sun Mar 22, 11:53AM",
    src: sampleSrc,
    status: "ready",
    uploadProgress: 1,
    transcriptionProgress: 1,
    prompt: promptPresets[0],
    emailOnComplete: false,
    uploadedByEmail: "sawyerhpowell@gmail.com",
    transcribedByEmail: "liujiayina@gmail.com",
    transcribedAt: "Mar 22, 12:01 PM",
    estimatedTranscriptionCost: "$0.17",
  },
  {
    id: "uploading-demo",
    title: "retreat_session_uploading.mp4",
    date: "Sun Mar 22, 11:53AM",
    src: sampleSrc,
    status: "uploading",
    uploadProgress: 0.42,
    transcriptionProgress: 0,
    prompt: promptPresets[0],
    emailOnComplete: false,
    uploadedByEmail: "liujiayina@gmail.com",
  },
  {
    id: "uploaded-demo",
    title: "morning_talk_uploaded.mp4",
    date: "Sun Mar 22, 11:53AM",
    src: sampleSrc,
    status: "uploaded",
    uploadProgress: 1,
    transcriptionProgress: 0,
    prompt: promptPresets[0],
    emailOnComplete: false,
    uploadedByEmail: "liujiayina@gmail.com",
  },
  {
    id: "upload-failed-demo",
    title: "upload_needs_retry.mp4",
    date: "Sun Mar 22, 11:53AM",
    src: sampleSrc,
    status: "uploadFailed",
    uploadProgress: 0.68,
    transcriptionProgress: 0,
    prompt: promptPresets[0],
    emailOnComplete: false,
    uploadedByEmail: "sawyerhpowell@gmail.com",
  },
  {
    id: "configuring-demo",
    title: "prompt_setup.mp4",
    date: "Sun Mar 22, 11:53AM",
    src: sampleSrc,
    status: "configuring",
    uploadProgress: 1,
    transcriptionProgress: 0,
    prompt: promptPresets[1],
    emailOnComplete: false,
    uploadedByEmail: "sawyerhpowell@gmail.com",
  },
  {
    id: "queued-demo",
    title: "queued_transcript.mp4",
    date: "Sun Mar 22, 11:53AM",
    src: sampleSrc,
    status: "queued",
    uploadProgress: 1,
    transcriptionProgress: 0,
    prompt: promptPresets[2],
    emailOnComplete: false,
    uploadedByEmail: "liujiayina@gmail.com",
  },
  {
    id: "transcribing-demo",
    title: "running_transcript.mp4",
    date: "Sun Mar 22, 11:53AM",
    src: sampleSrc,
    status: "transcribing",
    uploadProgress: 1,
    transcriptionProgress: 0.62,
    prompt: promptPresets[0],
    emailOnComplete: true,
    uploadedByEmail: "sawyerhpowell@gmail.com",
    transcribedByEmail: "sawyerhpowell@gmail.com",
    transcribedAt: "In progress",
    estimatedTranscriptionCost: "$0.25",
  },
  {
    id: "failed-demo",
    title: "needs_retry.mp4",
    date: "Sun Mar 22, 11:53AM",
    src: sampleSrc,
    status: "transcriptionFailed",
    uploadProgress: 1,
    transcriptionProgress: 0.28,
    prompt: promptPresets[0],
    emailOnComplete: false,
    uploadedByEmail: "liujiayina@gmail.com",
    transcribedByEmail: "liujiayina@gmail.com",
    transcribedAt: "Failed",
    estimatedTranscriptionCost: "$0.09",
  },
];

export const transcriptText = [
  "A quiet frame opens, giving the transcript room to lead.",
  "The video stays available without stealing the whole workspace.",
  "Each block tracks playback and can seek inside its own range.",
  "Focus follows the current line without turning the UI into a carnival.",
  "This is enough structure to replace later with real transcript data.",
];

export function friendlyDate(date: string) {
  return date
    .replace(/^[A-Za-z]+\s+/, "")
    .replace(/([AP]M)$/, " $1");
}

export function formatTranscriptTime(seconds: number) {
  return formatClockTime(seconds);
}

export function estimatedCostLabel(seconds: number) {
  return `$${Math.max(0.01, (Math.max(1, seconds) / 60) * GEMINI_TRANSCRIPTION_COST_PER_MINUTE).toFixed(2)}`;
}

export function videoLengthLabel(seconds: number) {
  return formatTranscriptTime(seconds || 5);
}

export function videoProgress(video: VideoItem) {
  if (video.status === "uploading" || video.status === "uploadFailed") return video.uploadProgress;
  if (video.status === "queued") return 0;
  if (video.status === "transcribing" || video.status === "transcriptionFailed") return video.transcriptionProgress;
  return 1;
}

export function showsProgressDial(status: VideoStatus) {
  return status === "uploading" ||
    status === "queued" ||
    status === "transcribing";
}

export function showsStatusDot(status: VideoStatus) {
  return status === "uploaded" ||
    status === "configuring" ||
    status === "uploadFailed" ||
    status === "transcriptionFailed";
}

export function isFailureStatus(status: VideoStatus) {
  return status === "uploadFailed" || status === "transcriptionFailed";
}
