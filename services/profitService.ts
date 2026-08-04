import { ProfitCalcInput, ProfitCalcResult } from '../types';

export function calculateProfit(input: ProfitCalcInput): ProfitCalcResult {
  const totalYieldQuintals = input.landAreaAcres * input.expectedYieldQuintalsPerAcre;
  const totalIncome = totalYieldQuintals * input.pricePerQuintal;
  const totalInvestment = input.fertilizerCost + input.labourCost + input.otherCost;
  const profit = totalIncome - totalInvestment;

  // Break-even yield: how many quintals are needed (at the given price) to cover costs.
  const breakEvenYieldQuintals = input.pricePerQuintal > 0 ? totalInvestment / input.pricePerQuintal : 0;

  // Break-even price: what price per quintal is needed (at the given yield) to cover costs.
  const breakEvenPricePerQuintal = totalYieldQuintals > 0 ? totalInvestment / totalYieldQuintals : 0;

  return {
    totalYieldQuintals,
    totalIncome,
    totalInvestment,
    profit,
    breakEvenYieldQuintals,
    breakEvenPricePerQuintal,
  };
}
