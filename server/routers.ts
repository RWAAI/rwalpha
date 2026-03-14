import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getNavHistory,
  insertNavHistory,
  getDividendRecords,
  insertDividendRecord,
  getLatestAiSignal,
  insertAiSignal,
  getRebalanceLogs,
  insertRebalanceLog,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  vault: router({
    // ── NAV History ──────────────────────────────────────────────
    getNavHistory: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(365).optional() }).optional())
      .query(async ({ input }) => {
        return getNavHistory(input?.limit ?? 90);
      }),

    addNavHistory: protectedProcedure
      .input(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        navValue: z.string(),
        totalReturn: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertNavHistory(input);
        return { success: true };
      }),

    // ── Dividend Records ─────────────────────────────────────────
    getDividendRecords: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(200).optional() }).optional())
      .query(async ({ input }) => {
        return getDividendRecords(input?.limit ?? 52);
      }),

    addDividendRecord: protectedProcedure
      .input(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        ticker: z.string().max(16),
        amountPerUnit: z.string(),
        totalAmount: z.string().optional(),
        frequency: z.string().max(16),
      }))
      .mutation(async ({ input }) => {
        await insertDividendRecord(input);
        return { success: true };
      }),

    // ── AI Signals ───────────────────────────────────────────────
    getLatestAiSignal: publicProcedure.query(async () => {
      return getLatestAiSignal();
    }),

    addAiSignal: protectedProcedure
      .input(z.object({
        signalDate: z.date(),
        marketSentiment: z.string().optional(),
        nvdyVolRisk: z.string().optional(),
        qqqiPremium: z.string().optional(),
        qqqmVgtMomentum: z.string().optional(),
        rebalanceSignal: z.string().optional(),
        rawJson: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertAiSignal(input);
        return { success: true };
      }),

    // ── Rebalance Logs ───────────────────────────────────────────
    getRebalanceLogs: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
      .query(async ({ input }) => {
        return getRebalanceLogs(input?.limit ?? 20);
      }),

    addRebalanceLog: protectedProcedure
      .input(z.object({
        actionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        icon: z.string().optional(),
        action: z.string(),
        tag: z.string().max(32),
        tagEn: z.string().max(32).optional(),
        actionEn: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertRebalanceLog(input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
