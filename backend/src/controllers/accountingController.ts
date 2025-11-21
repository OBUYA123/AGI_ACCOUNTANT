import { Response } from "express";
import {
  asyncHandler,
  successResponse,
  errorResponse,
  AppError,
} from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import AccountingToolResult from "../models/AccountingToolResult";
import { generatePDF } from "../utils/pdfGenerator";
import { z } from "zod";

/**
 * Balance Sheet Calculator
 * @route   POST /api/v1/accounting/balance-sheet
 * @access  Private
 */
export const calculateBalanceSheet = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      title: z.string().min(1, "Title is required"),
      date: z.string(),
      assets: z.object({
        currentAssets: z.object({
          cash: z.number(),
          accountsReceivable: z.number(),
          inventory: z.number(),
          otherCurrentAssets: z.number(),
        }),
        fixedAssets: z.object({
          propertyPlantEquipment: z.number(),
          accumulatedDepreciation: z.number(),
          intangibleAssets: z.number(),
        }),
      }),
      liabilities: z.object({
        currentLiabilities: z.object({
          accountsPayable: z.number(),
          shortTermDebt: z.number(),
          accruedExpenses: z.number(),
        }),
        longTermLiabilities: z.object({
          longTermDebt: z.number(),
          otherLongTermLiabilities: z.number(),
        }),
      }),
      equity: z.object({
        commonStock: z.number(),
        retainedEarnings: z.number(),
        otherEquity: z.number(),
      }),
    });

    const inputs = schema.parse(req.body);

    // Calculate totals
    const totalCurrentAssets =
      inputs.assets.currentAssets.cash +
      inputs.assets.currentAssets.accountsReceivable +
      inputs.assets.currentAssets.inventory +
      inputs.assets.currentAssets.otherCurrentAssets;

    const totalFixedAssets =
      inputs.assets.fixedAssets.propertyPlantEquipment -
      inputs.assets.fixedAssets.accumulatedDepreciation +
      inputs.assets.fixedAssets.intangibleAssets;

    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const totalCurrentLiabilities =
      inputs.liabilities.currentLiabilities.accountsPayable +
      inputs.liabilities.currentLiabilities.shortTermDebt +
      inputs.liabilities.currentLiabilities.accruedExpenses;

    const totalLongTermLiabilities =
      inputs.liabilities.longTermLiabilities.longTermDebt +
      inputs.liabilities.longTermLiabilities.otherLongTermLiabilities;

    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    const totalEquity =
      inputs.equity.commonStock +
      inputs.equity.retainedEarnings +
      inputs.equity.otherEquity;

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

    const results = {
      totalCurrentAssets,
      totalFixedAssets,
      totalAssets,
      totalCurrentLiabilities,
      totalLongTermLiabilities,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced,
      difference: totalAssets - totalLiabilitiesAndEquity,
    };

    // Save to database
    const toolResult = await AccountingToolResult.create({
      userId: req.user?._id,
      toolType: "balance_sheet",
      title: inputs.title,
      inputs,
      results,
    });

    return successResponse(res, "Balance sheet calculated successfully", {
      results,
      resultId: toolResult._id,
    });
  }
);

/**
 * Profit & Loss Statement
 * @route   POST /api/v1/accounting/profit-loss
 * @access  Private
 */
export const calculateProfitLoss = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      title: z.string().min(1, "Title is required"),
      period: z.string(),
      revenue: z.object({
        sales: z.number(),
        otherIncome: z.number(),
      }),
      costOfGoodsSold: z.number(),
      operatingExpenses: z.object({
        salaries: z.number(),
        rent: z.number(),
        utilities: z.number(),
        marketing: z.number(),
        depreciation: z.number(),
        other: z.number(),
      }),
      otherExpenses: z.number(),
      taxRate: z.number().min(0).max(100),
    });

    const inputs = schema.parse(req.body);

    // Calculations
    const totalRevenue = inputs.revenue.sales + inputs.revenue.otherIncome;
    const grossProfit = totalRevenue - inputs.costOfGoodsSold;
    const grossProfitMargin = (grossProfit / totalRevenue) * 100;

    const totalOperatingExpenses =
      inputs.operatingExpenses.salaries +
      inputs.operatingExpenses.rent +
      inputs.operatingExpenses.utilities +
      inputs.operatingExpenses.marketing +
      inputs.operatingExpenses.depreciation +
      inputs.operatingExpenses.other;

    const operatingIncome = grossProfit - totalOperatingExpenses;
    const operatingMargin = (operatingIncome / totalRevenue) * 100;

    const incomeBeforeTax = operatingIncome - inputs.otherExpenses;
    const taxExpense = (incomeBeforeTax * inputs.taxRate) / 100;
    const netIncome = incomeBeforeTax - taxExpense;
    const netProfitMargin = (netIncome / totalRevenue) * 100;

    const results = {
      totalRevenue,
      costOfGoodsSold: inputs.costOfGoodsSold,
      grossProfit,
      grossProfitMargin,
      totalOperatingExpenses,
      operatingIncome,
      operatingMargin,
      incomeBeforeTax,
      taxExpense,
      netIncome,
      netProfitMargin,
    };

    const toolResult = await AccountingToolResult.create({
      userId: req.user?._id,
      toolType: "profit_loss",
      title: inputs.title,
      inputs,
      results,
    });

    return successResponse(res, "Profit & Loss calculated successfully", {
      results,
      resultId: toolResult._id,
    });
  }
);

/**
 * Depreciation Calculator
 * @route   POST /api/v1/accounting/depreciation
 * @access  Private
 */
export const calculateDepreciation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      title: z.string().min(1, "Title is required"),
      assetName: z.string(),
      cost: z.number().positive(),
      salvageValue: z.number().min(0),
      usefulLife: z.number().positive(),
      method: z.enum(["straight_line", "declining_balance", "sum_of_years"]),
      decliningRate: z.number().optional(),
    });

    const inputs = schema.parse(req.body);

    const depreciableAmount = inputs.cost - inputs.salvageValue;
    let schedule: Array<{
      year: number;
      depreciation: number;
      accumulated: number;
      bookValue: number;
    }> = [];

    if (inputs.method === "straight_line") {
      const annualDepreciation = depreciableAmount / inputs.usefulLife;
      let accumulated = 0;

      for (let year = 1; year <= inputs.usefulLife; year++) {
        accumulated += annualDepreciation;
        schedule.push({
          year,
          depreciation: annualDepreciation,
          accumulated,
          bookValue: inputs.cost - accumulated,
        });
      }
    } else if (inputs.method === "declining_balance") {
      const rate = inputs.decliningRate || 2 / inputs.usefulLife;
      let bookValue = inputs.cost;
      let accumulated = 0;

      for (let year = 1; year <= inputs.usefulLife; year++) {
        const depreciation = Math.min(
          bookValue * rate,
          bookValue - inputs.salvageValue
        );
        accumulated += depreciation;
        bookValue -= depreciation;

        schedule.push({
          year,
          depreciation,
          accumulated,
          bookValue: Math.max(bookValue, inputs.salvageValue),
        });

        if (bookValue <= inputs.salvageValue) break;
      }
    } else if (inputs.method === "sum_of_years") {
      const sumOfYears = (inputs.usefulLife * (inputs.usefulLife + 1)) / 2;
      let accumulated = 0;

      for (let year = 1; year <= inputs.usefulLife; year++) {
        const depreciation =
          (depreciableAmount * (inputs.usefulLife - year + 1)) / sumOfYears;
        accumulated += depreciation;

        schedule.push({
          year,
          depreciation,
          accumulated,
          bookValue: inputs.cost - accumulated,
        });
      }
    }

    const results = {
      depreciableAmount,
      method: inputs.method,
      schedule,
      totalDepreciation: schedule.reduce(
        (sum, item) => sum + item.depreciation,
        0
      ),
    };

    const toolResult = await AccountingToolResult.create({
      userId: req.user?._id,
      toolType: "depreciation",
      title: inputs.title,
      inputs,
      results,
    });

    return successResponse(res, "Depreciation calculated successfully", {
      results,
      resultId: toolResult._id,
    });
  }
);

/**
 * Break-Even Analysis
 * @route   POST /api/v1/accounting/break-even
 * @access  Private
 */
export const calculateBreakEven = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const schema = z.object({
      title: z.string().min(1, "Title is required"),
      fixedCosts: z.number().min(0),
      variableCostPerUnit: z.number().min(0),
      pricePerUnit: z.number().positive(),
    });

    const inputs = schema.parse(req.body);

    const contributionMarginPerUnit =
      inputs.pricePerUnit - inputs.variableCostPerUnit;
    const contributionMarginRatio =
      (contributionMarginPerUnit / inputs.pricePerUnit) * 100;

    const breakEvenUnits = inputs.fixedCosts / contributionMarginPerUnit;
    const breakEvenRevenue = breakEvenUnits * inputs.pricePerUnit;

    const results = {
      contributionMarginPerUnit,
      contributionMarginRatio,
      breakEvenUnits: Math.ceil(breakEvenUnits),
      breakEvenRevenue,
    };

    const toolResult = await AccountingToolResult.create({
      userId: req.user?._id,
      toolType: "break_even",
      title: inputs.title,
      inputs,
      results,
    });

    return successResponse(res, "Break-even analysis completed successfully", {
      results,
      resultId: toolResult._id,
    });
  }
);

/**
 * Get User's Saved Results
 * @route   GET /api/v1/accounting/results
 * @access  Private
 */
export const getSavedResults = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { toolType, page = 1, limit = 10 } = req.query;

    const query: any = { userId: req.user?._id };
    if (toolType) query.toolType = toolType;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const results = await AccountingToolResult.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await AccountingToolResult.countDocuments(query);

    return successResponse(res, "Results retrieved successfully", {
      results,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  }
);

/**
 * Get Result by ID
 * @route   GET /api/v1/accounting/results/:id
 * @access  Private
 */
export const getResultById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await AccountingToolResult.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!result) {
      throw new AppError("Result not found", 404);
    }

    return successResponse(res, "Result retrieved successfully", { result });
  }
);

/**
 * Delete Result
 * @route   DELETE /api/v1/accounting/results/:id
 * @access  Private
 */
export const deleteResult = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await AccountingToolResult.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!result) {
      throw new AppError("Result not found", 404);
    }

    await result.deleteOne();

    return successResponse(res, "Result deleted successfully");
  }
);

/**
 * Export Result to PDF
 * @route   GET /api/v1/accounting/results/:id/export
 * @access  Private
 */
export const exportResultToPDF = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await AccountingToolResult.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    }).populate("userId", "firstName lastName email");

    if (!result) {
      throw new AppError("Result not found", 404);
    }

    const pdfBuffer = await generatePDF(result);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.toolType}_${result._id}.pdf"`
    );

    res.send(pdfBuffer);
  }
);
