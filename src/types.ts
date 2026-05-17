export enum ScanStatus {
  PENDING = "pending",
  SCANNING = "scanning",
  COMPLETED = "completed",
  FAILED = "failed"
}

export enum Severity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
  createdAt: any;
}

export interface Scan {
  id: string;
  userId: string;
  targetUrl: string;
  status: ScanStatus;
  currentStep?: string;
  createdAt: any;
  vulnerabilityCount: number;
}

export interface Vulnerability {
  id: string;
  scanId: string;
  type: string;
  severity: Severity;
  description: string;
  affectedArea: string;
  recommendation: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  activity: string;
  createdAt: any;
}
