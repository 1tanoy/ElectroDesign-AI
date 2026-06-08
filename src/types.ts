/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryId =
  | 'transformers'
  | 'ac_machines'
  | 'dc_machines'
  | 'modern_motors'
  | 'power_electronics'
  | 'renewable_energy'
  | 'power_systems';

export interface CategorySpec {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  equipments: {
    id: string;
    name: string;
    description: string;
    defaultInputs: Record<string, number | string>;
    inputSchema: InputField[];
  }[];
}

export interface InputField {
  key: string;
  label: string;
  type: 'number' | 'select' | 'text';
  unit?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface CalculationResults {
  electrical: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  magnetic: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  mechanical: {
    label: string;
    value: string | number;
    unit?: string;
    dimensionKey?: string; // Links to 2D drawing keys
  }[];
  thermal: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  manufacturing: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  economic: {
    copperCost: number;
    ironCost: number;
    insulationCost: number;
    structureCost: number;
    assemblyCost: number;
    totalCost: number;
    retailPrice: number;
    breakdown: { label: string; value: number }[];
    materials: {
      copper: number;
      steel: number;
      insulation: number;
      oil: number;
    };
    manufacturing: {
      labor: number;
      assembly: number;
      testing: number;
    };
    logistics: {
      packaging: number;
      transport: number;
      taxes: number;
    };
  };
  dimensions: Record<string, number>; // Dimensions in mm for 2D/3D visualization
  efficiencyCurve: { load: number; efficiency: number; voltageRegulation?: number }[];
  lossDistribution: { label: string; value: number }[];
  standards: string[];
}

export type OptimizationGoal = 'cost' | 'efficiency' | 'weight' | 'losses' | 'density';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface SavedSnapshot {
  id: string;
  name: string;
  timestamp: string;
  categoryId: CategoryId;
  equipmentId: string;
  equipmentName: string;
  inputs: Record<string, any>;
  results: CalculationResults;
  optimizationGoal: string;
}

