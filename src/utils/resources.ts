type AltParam = 
  | { altPlan: true, costEligible: boolean }
  | { altPlan: false, costEligible?: never }

type Base = {
  name: string,
  memberCost: number,
  clientCost: number,
  elections?: Election[],
}

export type Resource = Base & AltParam

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function altResource(name: string | null | undefined, cost: number = 0, costEligible: boolean = false): Resource {
  return {
    name: name ?? `Alt Resource (${usd.format(cost)})`,
    memberCost: cost,
    clientCost: 0,
    altPlan: true,
    costEligible,
  };
}

export function medicare(cost: number = 0): Resource {
  return {
    name: `Medicare (${usd.format(cost)})`,
    altPlan: true,
    memberCost: cost,
    clientCost: 0,
    costEligible: false,
  };
}

export function medicaid(): Resource {
  return {
    name: 'Medicaid',
    altPlan: true,
    memberCost: 0,
    clientCost: 0,
    costEligible: false,
  };
}

export function altEmployerPlan(name: string | null | undefined, cost: number): Resource {
  return {
    name: name ?? `Alternative Employer (${usd.format(cost)})`,
    altPlan: true,
    memberCost: cost,
    clientCost: 0,
    costEligible: true,
  };
}

export const ee: Resource = {
  name: 'Employee',
  altPlan: false,
  memberCost: 8500,
  clientCost: 19220.80,
};

export const es: Resource = {
  name: 'Employee/Spouse',
  altPlan: false,
  memberCost: 10500,
  clientCost: 28090.97,
};

export const ec: Resource = {
  name: 'Employee/Child',
  altPlan: false,
  memberCost: 9800,
  clientCost: 26181.02,
};

export const fam: Resource = {
  name: 'Family',
  altPlan: false,
  memberCost: 12062,
  clientCost: 32000.36,
};

export interface Election {
  name: string,
  defaultResource: Resource,
}