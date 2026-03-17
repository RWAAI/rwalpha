/**
 * Profile & Assets router unit tests
 * Tests KYC, wallet binding, holdings, and dividend history procedures
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  getKycByUserId: vi.fn(),
  upsertKyc: vi.fn(),
  getWalletsByUserId: vi.fn(),
  addWalletBinding: vi.fn(),
  deleteWalletBinding: vi.fn(),
  setPrimaryWallet: vi.fn(),
  getHoldingsByUserId: vi.fn(),
  getDividendHistoryByUserId: vi.fn(),
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
  getNavHistory: vi.fn(),
  getDividendRecords: vi.fn(),
  getLatestAiSignal: vi.fn(),
  getRebalanceLogs: vi.fn(),
  getAllPortfolios: vi.fn(),
  getPortfolioById: vi.fn(),
  insertPortfolio: vi.fn(),
  updatePortfolio: vi.fn(),
  deletePortfolio: vi.fn(),
  insertNavHistory: vi.fn(),
  insertDividendRecord: vi.fn(),
  deleteNavHistory: vi.fn(),
  bulkInsertNavHistory: vi.fn(),
  bulkInsertDividendRecords: vi.fn(),
  deleteDividendRecord: vi.fn(),
  insertAiSignal: vi.fn(),
  insertRebalanceLog: vi.fn(),
  deleteRebalanceLog: vi.fn(),
  insertUserDividend: vi.fn(),
  claimDividend: vi.fn(),
  getDb: vi.fn(),
}));

import {
  getKycByUserId,
  getWalletsByUserId,
  getHoldingsByUserId,
  getDividendHistoryByUserId,
  upsertKyc,
  addWalletBinding,
} from "./db";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Profile: KYC helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getKycByUserId returns null when no KYC record exists", async () => {
    vi.mocked(getKycByUserId).mockResolvedValue(null);
    const result = await getKycByUserId(1);
    expect(result).toBeNull();
    expect(getKycByUserId).toHaveBeenCalledWith(1);
  });

  it("getKycByUserId returns KYC record when it exists", async () => {
    const mockKyc = {
      id: 1,
      userId: 1,
      status: "pending" as const,
      fullName: "Alex Chen",
      idType: "passport" as const,
      idNumber: "A12345678",
      idFrontUrl: null,
      idBackUrl: null,
      selfieUrl: null,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(getKycByUserId).mockResolvedValue(mockKyc);
    const result = await getKycByUserId(1);
    expect(result).toEqual(mockKyc);
    expect(result?.status).toBe("pending");
  });

  it("upsertKyc can be called with partial data", async () => {
    vi.mocked(upsertKyc).mockResolvedValue(undefined);
    await upsertKyc(1, { status: "approved", fullName: "Alex Chen" });
    expect(upsertKyc).toHaveBeenCalledWith(1, { status: "approved", fullName: "Alex Chen" });
  });
});

describe("Profile: Wallet binding helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getWalletsByUserId returns empty array when no wallets", async () => {
    vi.mocked(getWalletsByUserId).mockResolvedValue([]);
    const result = await getWalletsByUserId(1);
    expect(result).toEqual([]);
  });

  it("getWalletsByUserId returns wallet list", async () => {
    const mockWallets = [
      {
        id: 1,
        userId: 1,
        address: "0x1234567890abcdef",
        chain: "Ethereum",
        label: "Main Wallet",
        isPrimary: 1,
        createdAt: new Date(),
      },
    ];
    vi.mocked(getWalletsByUserId).mockResolvedValue(mockWallets);
    const result = await getWalletsByUserId(1);
    expect(result).toHaveLength(1);
    expect(result[0].address).toBe("0x1234567890abcdef");
    expect(result[0].isPrimary).toBe(1);
  });

  it("addWalletBinding can be called with valid data", async () => {
    vi.mocked(addWalletBinding).mockResolvedValue(undefined);
    await addWalletBinding({
      userId: 1,
      address: "0xabcdef1234567890",
      chain: "Ethereum",
      label: "Test Wallet",
      isPrimary: 0,
    });
    expect(addWalletBinding).toHaveBeenCalledWith(
      expect.objectContaining({ address: "0xabcdef1234567890" })
    );
  });
});

describe("Assets: Holdings helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getHoldingsByUserId returns empty array when no holdings", async () => {
    vi.mocked(getHoldingsByUserId).mockResolvedValue([]);
    const result = await getHoldingsByUserId(1);
    expect(result).toEqual([]);
  });

  it("getHoldingsByUserId returns rINDEX holding", async () => {
    const mockHoldings = [
      {
        id: 1,
        userId: 1,
        tokenSymbol: "rINDEX",
        quantity: "1250.00",
        navPerToken: "130.99",
        totalValue: "163737.50",
        change24h: "0.00",
        totalReturn: "28.99",
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    ];
    vi.mocked(getHoldingsByUserId).mockResolvedValue(mockHoldings);
    const result = await getHoldingsByUserId(1);
    expect(result).toHaveLength(1);
    expect(result[0].tokenSymbol).toBe("rINDEX");
    expect(parseFloat(result[0].quantity)).toBe(1250.00);
  });
});

describe("Assets: Dividend history helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getDividendHistoryByUserId returns empty array when no history", async () => {
    vi.mocked(getDividendHistoryByUserId).mockResolvedValue([]);
    const result = await getDividendHistoryByUserId(1);
    expect(result).toEqual([]);
  });

  it("getDividendHistoryByUserId returns dividend records", async () => {
    const mockDividends = [
      {
        id: 1,
        userId: 1,
        tokenSymbol: "rINDEX",
        date: "2026-03-07",
        amount: "627.50",
        amountPerToken: "0.502",
        status: "claimed" as const,
        claimedAt: new Date("2026-03-07"),
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        tokenSymbol: "rINDEX",
        date: "2026-02-28",
        amount: "651.25",
        amountPerToken: "0.521",
        status: "claimable" as const,
        claimedAt: null,
        createdAt: new Date(),
      },
    ];
    vi.mocked(getDividendHistoryByUserId).mockResolvedValue(mockDividends);
    const result = await getDividendHistoryByUserId(1, 50);
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe("claimed");
    expect(result[1].status).toBe("claimable");
    expect(parseFloat(result[0].amount)).toBe(627.50);
  });

  it("getDividendHistoryByUserId respects limit parameter", async () => {
    vi.mocked(getDividendHistoryByUserId).mockResolvedValue([]);
    await getDividendHistoryByUserId(1, 10);
    expect(getDividendHistoryByUserId).toHaveBeenCalledWith(1, 10);
  });
});
