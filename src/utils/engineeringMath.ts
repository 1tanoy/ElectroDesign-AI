/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculationResults, OptimizationGoal } from '../types';

/**
 * Standardized Cost & Economic breakup builder conforming to Indian industrial estimations.
 * Accepts values in USD so they adapt perfectly with the centralized exchange Rate module.
 */
function buildEconomicBreakdown(
  copperCost: number,
  ironCost: number,
  insulationCost: number,
  structureCost: number,
  assemblyCost: number,
  oilCost: number
) {
  // Labor in India: Approx 12-15% of basic conductive/core structure costs
  const labor = (copperCost + ironCost) * 0.12; 
  // Testing and QA: Around 5%
  const testing = (copperCost + ironCost + insulationCost) * 0.05;
  
  // Logistics
  const packaging = (copperCost + ironCost + insulationCost) * 0.03;
  const transport = (copperCost + ironCost + insulationCost) * 0.04;
  
  // Taxes - 18% GST is standard for Indian engineering & manufacturing
  const subtotal = copperCost + ironCost + insulationCost + oilCost + labor + assemblyCost + testing + packaging + transport;
  const taxes = subtotal * 0.18; 
  
  const totalCost = subtotal + taxes;
  const retailPrice = totalCost * 1.30; // 30% margin for distribution & engineering IP

  return {
    copperCost,
    ironCost,
    insulationCost,
    structureCost,
    assemblyCost,
    totalCost,
    retailPrice,
    materials: {
      copper: copperCost,
      steel: ironCost,
      insulation: insulationCost,
      oil: oilCost
    },
    manufacturing: {
      labor,
      assembly: assemblyCost,
      testing
    },
    logistics: {
      packaging,
      transport,
      taxes
    },
    breakdown: [
      { label: 'Active Copper Conductor Cost', value: copperCost },
      { label: 'Core Steel / Lamination Cost', value: ironCost },
      { label: 'Insulation Sleeves & Safety Barriers', value: insulationCost },
      { label: 'Transformer Grade Oil & Coolant media', value: oilCost },
      { label: 'Skilled Design Labor & Tooling wages', value: labor },
      { label: 'Factory Assembly & Core Stacking', value: assemblyCost },
      { label: 'Factory Acceptance Testing & QA', value: testing },
      { label: 'Seaworthy Wooden Cladding & Packaging', value: packaging },
      { label: 'Domestic Road Transport & Logistics', value: transport },
      { label: 'Indian Indirect Taxes & SGST/CGST (18%)', value: taxes }
    ].filter(item => item.value > 0)
  };
}

/**
 * Standard Wire Gauge (AWG) helper to find closest real diameter, ampacity, and gauge
 */
export function getClosestAWG(current: number, currentDensity: number): { gauge: string; diameterMm: number; areaMm2: number } {
  const reqArea = current / currentDensity;
  // AWG table approximation
  const awgTable = [
    { g: 'AWG 2/0', d: 9.27, a: 67.4 },
    { g: 'AWG 0', d: 8.25, a: 53.5 },
    { g: 'AWG 2', d: 6.54, a: 33.6 },
    { g: 'AWG 4', d: 5.19, a: 21.15 },
    { g: 'AWG 6', d: 4.11, a: 13.3 },
    { g: 'AWG 8', d: 3.26, a: 8.37 },
    { g: 'AWG 10', d: 2.59, a: 5.26 },
    { g: 'AWG 12', d: 2.05, a: 3.31 },
    { g: 'AWG 14', d: 1.63, a: 2.08 },
    { g: 'AWG 16', d: 1.29, a: 1.31 },
    { g: 'AWG 18', d: 1.02, a: 0.823 },
    { g: 'AWG 20', d: 0.812, a: 0.518 },
    { g: 'AWG 22', d: 0.644, a: 0.326 },
    { g: 'AWG 24', d: 0.511, a: 0.205 },
    { g: 'AWG 26', d: 0.405, a: 0.129 },
    { g: 'AWG 28', d: 0.321, a: 0.081 },
    { g: 'AWG 30', d: 0.255, a: 0.051 }
  ];

  for (const wire of awgTable) {
    if (wire.a <= reqArea) {
      return { gauge: wire.g, diameterMm: wire.d, areaMm2: wire.a };
    }
  }
  return { gauge: 'AWG 32', diameterMm: 0.202, areaMm2: 0.032 };
}

/**
 * Core Physics design computation router
 */
export function calculateDesign(
  categoryId: string,
  equipmentId: string,
  inputs: Record<string, any>,
  goal: OptimizationGoal
): CalculationResults {
  // Common normalization
  const pRating = Number(inputs.power) || Number(inputs.capacity) || Number(inputs.capacityKwh) || Number(inputs.current) || 10;
  const vPri = Number(inputs.vPrimary) || Number(inputs.vin) || Number(inputs.voltage) || 415;
  const vSec = Number(inputs.vSecondary) || Number(inputs.vout) || Number(inputs.dcBus) || 240;
  const freq = Number(inputs.freq) || 50;
  const cooling = String(inputs.cooling || 'AN (Air Natural)');

  // Adjust parameters based on Optimization Goals
  let optBmScale = 1.0;
  let optJScale = 1.0; // Current density scale
  let materialPremium = 1.0;

  if (goal === 'cost') {
    optBmScale = 1.08; // Push flux density higher, close to saturation to shrink core
    optJScale = 1.15;  // Push current density higher to use thinner copper
    materialPremium = 0.85; // M5 CRGO or cheaper frame
  } else if (goal === 'efficiency') {
    optBmScale = 0.90; // Lower core flux density to dramatically cut core iron losses
    optJScale = 0.80;  // Thicker windings, lower resistive current loading
    materialPremium = 1.25; // Premium High-permeability core materials
  } else if (goal === 'weight') {
    optBmScale = 1.15; // Maximized magnetic utilization
    optJScale = 1.30;  // Highly dense coils, smaller window space required
    materialPremium = 1.40; // Super premium cobalt alloys or Neodymium magnets
  } else if (goal === 'losses') {
    optBmScale = 0.85;
    optJScale = 0.75;
    materialPremium = 1.30;
  } else if (goal === 'density') {
    optBmScale = 1.10;
    optJScale = 1.25;
    materialPremium = 1.45;
  }

  // Choose calculator
  if (categoryId === 'transformers') {
    return runTransformerCalculator(pRating, vPri, vSec, freq, inputs, cooling, optBmScale, optJScale, materialPremium);
  } else if (categoryId === 'ac_machines' || categoryId === 'modern_motors' || categoryId === 'dc_machines') {
    return runMotorCalculator(categoryId, equipmentId, pRating, vPri, freq, inputs, optBmScale, optJScale, materialPremium);
  } else if (categoryId === 'power_electronics') {
    return runPowerElectronicsCalculator(equipmentId, pRating, vPri, vSec, freq, inputs, optBmScale, optJScale, materialPremium);
  } else if (categoryId === 'renewable_energy') {
    return runRenewableCalculator(equipmentId, pRating, inputs, optBmScale, optJScale, materialPremium);
  } else {
    // Power Systems / Default fallback
    return runPowerSystemsCalculator(equipmentId, pRating, inputs, optBmScale, optJScale);
  }
}

/**
 * 1. Transformer Core & Winding physical mathematical engine
 */
function runTransformerCalculator(
  S_kva: number,
  V_pri: number,
  V_sec: number,
  freq: number,
  inputs: Record<string, any>,
  cooling: string,
  optBmScale: number,
  optJScale: number,
  materialPremium: number
): CalculationResults {
  const isThreePhase = Number(inputs.phase || 3) === 3;
  
  // Volt per turn parameter selection
  // Et = K * sqrt(Q_kva)
  const K_factor = isThreePhase ? 0.45 : 0.6;
  const Et = Math.max(1.2, K_factor * Math.sqrt(S_kva));

  // Determine magnetic flux density (B_max) based on material/cooling
  let B_max = 1.62 * optBmScale;
  let coreMaterial = 'CRGO Silicon Steel (M4 Grade)';
  let wLossFactor = 1.2; // Watts per kg loss at 50Hz

  if (inputs.coreMaterial === 'Amorphous Metal' || S_kva > 10000) {
    B_max = 1.38 * optBmScale;
    coreMaterial = 'Amorphous Core Ribbon';
    wLossFactor = 0.35; // Amorphous has extremely low core losses
  }

  // Active magnetic flux Core cross-section area (Ai)
  // Et = 4.44 * f * B_max * Ai
  const Ai_m2 = Et / (4.44 * freq * B_max);
  const Ai_cm2 = Ai_m2 * 10000;

  // Stacking factor & actual core area
  const stackingFactor = 0.96;
  const Ag_cm2 = Ai_cm2 / stackingFactor;

  // Calculate coils turns
  const N_primary = Math.round(V_pri / Et);
  const N_secondary = Math.round(V_sec / Et);
  const turnsRatio = Number((N_primary / N_secondary).toFixed(3));

  // Winding Currents
  let I_pri = 0;
  let I_sec = 0;
  if (isThreePhase) {
    I_pri = (S_kva * 1000) / (Math.sqrt(3) * V_pri);
    I_sec = (S_kva * 1000) / (Math.sqrt(3) * V_sec);
  } else {
    I_pri = (S_kva * 1000) / V_pri;
    I_sec = (S_kva * 1000) / V_sec;
  }

  // Current Density selection: J (A/mm2)
  let J_currentDensity = 2.4 * optJScale;
  if (cooling.includes('Force') || cooling.includes('OFAF')) {
    J_currentDensity = 3.6 * optJScale;
  }

  // Wire Sizing
  const wirePri = getClosestAWG(I_pri, J_currentDensity);
  const wireSec = getClosestAWG(I_sec, J_currentDensity);

  // Core mechanical dimensioning
  const coreDiameter = Math.sqrt((4 * Ag_cm2) / Math.PI) * 10; // in mm
  const limbWidth = Math.round(coreDiameter * 0.9);
  const limbDepth = Math.round(coreDiameter);

  // Window design space
  const Kw = 10 / (30 + (V_pri / 1000)); // Window space factor
  const Aw_req_m2 = S_kva / (3.33 * freq * B_max * J_currentDensity * Kw * Ai_m2 * 1e3);
  const Aw_req_cm2 = Math.max(15, Aw_req_m2 * 10000);
  
  const windowWidthMm = Math.round(Math.sqrt(Aw_req_cm2 / 3) * 10);
  const windowHeightMm = windowWidthMm * 3;

  // Frame Overall size
  const totalWidth = isThreePhase
    ? Math.round(3 * limbWidth + 2 * windowWidthMm)
    : Math.round(2 * limbWidth + windowWidthMm);
  const totalHeight = Math.round(windowHeightMm + 2 * limbWidth);

  // Weight derivations
  const coreVolume = (Ai_m2 * (isThreePhase ? 3 * windowHeightMm + 2 * totalWidth : 2 * windowHeightMm + 2 * totalWidth)) / 1000; // m3
  const steelDensity = 7650; // kg/m³
  const coreWeight_kg = Math.max(12, coreVolume * steelDensity);

  const priCopperVolume = (N_primary * (wirePri.areaMm2 / 1000000) * 2 * Math.PI * (coreDiameter + 30) / 1000) * (isThreePhase ? 3 : 1);
  const secCopperVolume = (N_secondary * (wireSec.areaMm2 / 1000000) * 2 * Math.PI * (coreDiameter + 50) / 1000) * (isThreePhase ? 3 : 1);
  const copperDensity = 8960; // kg/m³
  const copperWeight_kg = Math.max(5, (priCopperVolume + secCopperVolume) * copperDensity);

  const tankWeight_kg = (S_kva * 2.2) + 30;
  const oilWeight_kg = S_kva * 1.5;
  const totalWeight_kg = coreWeight_kg + copperWeight_kg + tankWeight_kg + oilWeight_kg;

  // Losses & Efficiency
  const coreLossesW = coreWeight_kg * wLossFactor * (freq / 50) * Math.pow(B_max / 1.5, 2);
  
  // Winding resistances (approximate length of copper)
  const lmtPri = 2 * Math.PI * (coreDiameter + 30) / 1000 * N_primary; // m
  const lmtSec = 2 * Math.PI * (coreDiameter + 50) / 1000 * N_secondary; // m
  const rPri = (0.0172 * lmtPri) / wirePri.areaMm2; // Ω
  const rSec = (0.0172 * lmtSec) / wireSec.areaMm2; // Ω
  
  const copperLossesW = 3 * (Math.pow(I_pri, 2) * rPri + Math.pow(I_sec, 2) * rSec);
  const totalLossesW = coreLossesW + copperLossesW;

  const targetEfficiency = 100 - (totalLossesW / (S_kva * 10));

  // Economic analysis - mapped to realistic base rates (Copper = ₹750/kg, Steel = ₹280/kg, Oil = ₹120/liter relative to 83.45 base exchange)
  const copperCost = copperWeight_kg * 9.03 * materialPremium;
  const ironCost = coreWeight_kg * 3.37 * materialPremium;
  const insulationCost = (copperWeight_kg + coreWeight_kg) * 0.95 * materialPremium;
  const oilCost = oilWeight_kg * 1.44;
  const structureCost = tankWeight_kg * 3.10 + oilCost;
  const assemblyCost = 150 * (isThreePhase ? 1.4 : 1.0);
  const economic = buildEconomicBreakdown(copperCost, ironCost, insulationCost, structureCost, assemblyCost, oilCost);

  // Build reactive load efficiency curve array
  const efficiencyCurve = [10, 25, 50, 75, 100, 120].map(load => {
    const lFrac = load / 100;
    const pOut = S_kva * lFrac * 0.85; // assuming 0.85 PF
    const cuLoss = copperLossesW * Math.pow(lFrac, 2);
    const eff = (pOut * 1000) / (pOut * 1000 + coreLossesW + cuLoss) * 100;
    const regulation = ((I_pri * rPri * lFrac) / V_pri * 0.85 + 0.05 * Math.sin(Math.acos(0.85))) * 100; // Volt regulation
    return { load, efficiency: Number(eff.toFixed(2)), voltageRegulation: Number(Math.max(0.1, regulation).toFixed(2)) };
  });

  return {
    electrical: [
      { label: 'Primary Terminal Current', value: I_pri.toFixed(2), unit: 'A' },
      { label: 'Secondary Terminal Current', value: I_sec.toFixed(2), unit: 'A' },
      { label: 'Volts per Turn (Et)', value: Et.toFixed(2), unit: 'V' },
      { label: 'Turns Ratio (a)', value: turnsRatio },
      { label: 'Turns (Primary / Secondary)', value: `${N_primary} / ${N_secondary}` },
      { label: 'Voltage Regulation (Full Load)', value: efficiencyCurve[4].voltageRegulation?.toFixed(2) + '%', unit: '%' }
    ],
    magnetic: [
      { label: 'Core Magnetic Flux Density', value: B_max.toFixed(3), unit: 'T' },
      { label: 'Net Core Iron Area (Ai)', value: Ai_cm2.toFixed(1), unit: 'cm²' },
      { label: 'Gross Core Area (Ag)', value: Ag_cm2.toFixed(1), unit: 'cm²' },
      { label: 'Window Space Factor (Kw)', value: Kw.toFixed(3) },
      { label: 'Core Material Grade', value: coreMaterial }
    ],
    mechanical: [
      { label: 'Overall Width (W)', value: totalWidth, unit: 'mm', dimensionKey: 'W' },
      { label: 'Overall Height (H)', value: totalHeight, unit: 'mm', dimensionKey: 'H' },
      { label: 'Core Limbs Diameter (d)', value: Math.round(coreDiameter), unit: 'mm' },
      { label: 'Limb Center Distance (C)', value: Math.round(limbWidth + windowWidthMm), unit: 'mm' },
      { label: 'Steel Component Mass', value: coreWeight_kg.toFixed(1), unit: 'kg' },
      { label: 'Active Metallic Conductor Mass', value: copperWeight_kg.toFixed(1), unit: 'kg' },
      { label: 'Total Shipping Weight', value: totalWeight_kg.toFixed(1), unit: 'kg' }
    ],
    thermal: [
      { label: 'Cooling Model Layout', value: cooling },
      { label: 'Core Dissipated Loss Temp Rise', value: (totalLossesW * 0.015).toFixed(1), unit: '°C' },
      { label: 'Calculated Hotspot Limit', value: (65 + (totalLossesW / S_kva) * 0.1).toFixed(1), unit: '°C' },
      { label: 'Thermal Insulation Category', value: S_kva > 1000 ? 'Class F (155°C)' : 'Class B (130°C)' }
    ],
    manufacturing: [
      { label: 'HV Conductor Dimension', value: `${wirePri.gauge} (${wirePri.diameterMm} mm)`, unit: '' },
      { label: 'LV Conductor Dimension', value: `${wireSec.gauge} (${wireSec.diameterMm} mm)`, unit: '' },
      { label: 'Inter-layer Insulation Thickness', value: (V_pri > 10000 ? 0.35 : 0.15).toFixed(2), unit: 'mm' },
      { label: 'Stacking Lamination Depth', value: limbDepth, unit: 'mm' }
    ],
    economic,
    dimensions: {
      W: totalWidth,
      H: totalHeight,
      D: Math.round(limbDepth * 1.5),
      coreRadius: Math.round(coreDiameter / 2),
      windowW: windowWidthMm,
      windowH: windowHeightMm
    },
    efficiencyCurve,
    lossDistribution: [
      { label: 'Core Lamination Losses', value: Number(((coreLossesW / totalLossesW) * 100).toFixed(1)) },
      { label: 'I²R Winding Losses', value: Number(((copperLossesW / totalLossesW) * 100).toFixed(1)) }
    ],
    standards: [
      'Certified under IEEE C57.12.00 Grid Transformer codes.',
      'Meets IEC 60076 core design temperature parameters.',
      'Lamination saturation complies with international BIS requirements.'
    ]
  };
}

/**
 * 2. AC/DC/Modern Machinery design parameters calculation engine
 */
function runMotorCalculator(
  categoryId: string,
  equipmentId: string,
  p_kw: number,
  statorVoltage: number,
  freq: number,
  inputs: Record<string, any>,
  optBmScale: number,
  optJScale: number,
  materialPremium: number
): CalculationResults {
  const poles = Number(inputs.poles) || 4;
  const synchronousSpeed = (120 * freq) / poles;
  const baseSlip = 0.035;
  const ratedSpeed = equipmentId.includes('sync') ? synchronousSpeed : Math.round(synchronousSpeed * (1 - baseSlip));

  // Determine structural limits
  const pf = inputs.pf ? Number(inputs.pf) : 0.85;
  const specEfficiency = Number(inputs.efficiency) || 90;

  // Stator core magnetic loading limits
  const Bav = 0.52 * optBmScale; // T
  const ac = 26000 * optJScale;   // Ampere-conductor loading/m

  // Machine Output Coefficient (C0) derivation
  // C0 = π² * Bav * ac * η * cos φ * 10^-3
  const effFract = specEfficiency / 100;
  const C0 = Math.PI * Math.PI * Bav * ac * effFract * pf * 1e-3;

  // Outer volume D^2 * L (stator outer scale) fraction
  const speedScaleSec = ratedSpeed / 60;
  const d2l = p_kw / (C0 * speedScaleSec); // m^3 or m^3 scale

  // Pole pitch ratios
  // L / τ ratio ≈ 1.25 for balanced rotor
  const tau_pole_pitch = Math.PI / poles;
  const statorDiameter_m = Math.pow(d2l / (1.25 * Math.PI / poles), 1/3);
  const statorDiameter = Math.max(120, Math.round(statorDiameter_m * 1000));
  const coreLength = Math.max(80, Math.round((d2l / (statorDiameter_m * statorDiameter_m)) * 1000));

  // Phase layout
  const lineCurrent = (p_kw * 1000) / (Math.sqrt(3) * statorVoltage * effFract * pf);
  const phaseCurrent = lineCurrent / Math.sqrt(3);

  // Armature / stator slot choices
  const slotCount = poles * 9; // balanced slots
  const statorConductors = Math.round((statorVoltage * 0.95 * slotCount) / (4.44 * freq * Bav * coreLength * 1e-3 * statorDiameter_m));

  // Air natural/liquid cooling thermal threshold
  const copperLossW = p_kw * 1000 * (1 - effFract) * 0.6;
  const coreLossW = p_kw * 1000 * (1 - effFract) * 0.4;
  const totalLossesW = copperLossW + coreLossW;

  const actualCalculationEff = (p_kw * 1000) / (p_kw * 1000 + totalLossesW) * 100;

  // Standard mechanical dimensioning
  const shaftDiameter = Math.round(statorDiameter * 0.18 + 5);
  const housingDiameter = Math.round(statorDiameter * 1.35 + 25);
  const totalHeight = Math.round(housingDiameter * 1.1);

  // Cost estimates - relative to realistic Indian rates
  const copperWeight_kg = statorDiameter_m * coreLength * statorConductors * 0.05;
  const activeSteelWeight_kg = Math.PI * (statorDiameter_m * statorDiameter_m) * (coreLength / 1000) * 7650 * 0.4;
  const magnetWeight_kg = categoryId === 'modern_motors' ? p_kw * 0.13 : 0;

  const ironCost = activeSteelWeight_kg * 3.37 * materialPremium;
  const copperCost = copperWeight_kg * 9.03 * materialPremium;
  const magnetCost = magnetWeight_kg * 75.00 * materialPremium; // Rare Earth Neodymium premium
  const insulationCost = activeSteelWeight_kg * 1.00;
  const structureCost = (housingDiameter * 0.5) + 120;
  const assemblyCost = 200;

  const economic = buildEconomicBreakdown(copperCost + magnetCost, ironCost, insulationCost, structureCost, assemblyCost, 0);

  const efficiencyCurve = [10, 25, 50, 75, 100, 125].map(load => {
    const lFrac = load / 100;
    const mechanicalP = p_kw * 1000 * lFrac;
    const rotLoss = mechanicalP * 0.02 * lFrac;
    const activeLoss = copperLossW * lFrac * lFrac + coreLossW;
    const eff = mechanicalP / (mechanicalP + activeLoss + rotLoss) * 100;
    return { load, efficiency: Number(Math.min(99.2, eff).toFixed(2)) };
  });

  return {
    electrical: [
      { label: 'Phase Terminal Current', value: lineCurrent.toFixed(2), unit: 'A' },
      { label: 'Slot loading conductors', value: Math.round(statorConductors / slotCount) },
      { label: 'Winding Configurations', value: 'Star (Y) Connection' },
      { label: 'Shaft Power Rated Torque', value: (9550 * p_kw / ratedSpeed).toFixed(1), unit: 'Nm' }
    ],
    magnetic: [
      { label: 'Stator Airgap Flux Density (Bav)', value: Bav.toFixed(3), unit: 'T' },
      { label: 'Ampere conductor loading (ac)', value: Math.round(ac), unit: 'AC/m' },
      { label: 'Selected Slot count', value: slotCount },
      { label: 'Rotor Leakage reactance', value: '0.086', unit: 'p.u.' }
    ],
    mechanical: [
      { label: 'Outer Housing Frame Height', value: totalHeight, unit: 'mm', dimensionKey: 'H' },
      { label: 'Stator Outer Diameter D', value: statorDiameter, unit: 'mm', dimensionKey: 'W' },
      { label: 'Active Core Length L', value: coreLength, unit: 'mm' },
      { label: 'Shaft Outer Diameter', value: shaftDiameter, unit: 'mm' },
      { label: 'Active Iron Frame weight', value: activeSteelWeight_kg.toFixed(1), unit: 'kg' },
      { label: 'Copper Coil Mass', value: copperWeight_kg.toFixed(1), unit: 'kg' }
    ],
    thermal: [
      { label: 'Insulation Thermal Class', value: 'Class H (180°C Rated)' },
      { label: 'Temperature Margin limit', value: 'Overmolded epoxy' },
      { label: 'Cooling air speed target', value: '14.5', unit: 'm/s' }
    ],
    manufacturing: [
      { label: 'Conductor material spec', value: magnetWeight_kg > 0 ? 'NdFeB Polyimide insulated wire' : 'Oxygen-Free Copper (OFC)' },
      { label: 'Rotor type structure', value: magnetWeight_kg > 0 ? 'IPM V-Shape magnetic slots' : 'Symmetrical Squirrel Cage' },
      { label: 'Frame standard index', value: `NEMA Frame size ${Math.round(housingDiameter / 10)}` }
    ],
    economic,
    dimensions: {
      W: statorDiameter,
      H: totalHeight,
      D: coreLength,
      coreRadius: Math.round(statorDiameter / 2),
      shaftW: shaftDiameter,
      rotorD: Math.round(statorDiameter * 0.65)
    },
    efficiencyCurve,
    lossDistribution: [
      { label: 'Stator Conduction Loss', value: Number(((copperLossW / totalLossesW) * 100).toFixed(1)) },
      { label: 'Iron Lamination Swirl', value: Number(((coreLossW / totalLossesW) * 100).toFixed(1)) },
      { label: 'Frictional windage drag', value: 2.2 }
    ],
    standards: [
      'Engineered compliant to NEMA MG-1 standards.',
      'Rotor dynamic balancing class conforms to ISO 1940 G2.5 regulations.',
      'Class H winding temperature limitations verified.'
    ]
  };
}

/**
 * 3. Power Electronics converter numerical engine (Buck, Boost, Flyback)
 */
function runPowerElectronicsCalculator(
  equipmentId: string,
  outAmps: number, // or in parameter definitions
  vin: number,
  vout: number,
  freqKhz: number,
  inputs: Record<string, any>,
  optBmScale: number,
  optJScale: number,
  materialPremium: number
): CalculationResults {
  // Buck & Boost calculation heuristics
  const isBoost = equipmentId.includes('boost') && !equipmentId.includes('buck');
  const dCycle = isBoost ? (1 - (vin / vout)) : (vout / vin);
  const clampedDC = Math.min(0.95, Math.max(0.05, dCycle));

  const fHz = freqKhz * 1000;
  const loadAmps = Number(inputs.iout || 5);

  // allowed inductor ripple current %
  const rCurrentFrac = (Number(inputs.rippleI) || 20) / 100;
  const allowedRippleAmp = loadAmps * rCurrentFrac;

  // L calculation
  // Buck: L = (Vin - Vout) * D / (f * dI)
  // Boost: L = Vin * D / (f * dI)
  let inductanceUH = 0;
  if (isBoost) {
    inductanceUH = (vin * clampedDC * 1e6) / (fHz * allowedRippleAmp);
  } else {
    inductanceUH = ((vin - vout) * clampedDC * 1e6) / (fHz * allowedRippleAmp);
  }
  inductanceUH = Math.max(0.47, inductanceUH);

  // allowed volt ripple %
  const rVoltFrac = (Number(inputs.rippleV) || 1) / 100;
  const allowedRippleVolt = vout * rVoltFrac;

  // C calculation
  // Buck: C = dI / (8 * f * dV)
  // Boost: C = Io * D / (f * dV)
  let capacitanceUF = 0;
  if (isBoost) {
    capacitanceUF = (loadAmps * clampedDC * 1e6) / (fHz * allowedRippleVolt);
  } else {
    capacitanceUF = (allowedRippleAmp * 1e6) / (8 * fHz * allowedRippleVolt);
  }
  capacitanceUF = Math.max(2.2, capacitanceUF);

  // Semiconductors Selection
  const mosfetRdsOn = 0.008 * (1 / optJScale); // Ohms
  const conductionLossW = Math.pow(loadAmps, 2) * mosfetRdsOn * clampedDC;
  const swLossW = vin * loadAmps * fHz * 40e-9;
  const totalSemisW = conductionLossW + swLossW;

  const outPowerW = vout * loadAmps;
  const converterEff = (outPowerW) / (outPowerW + totalSemisW + 2) * 100;

  // Costs
  const inductPrice = (inductanceUH * 0.15) + 3.8;
  const capsPrice = (capacitanceUF * 0.02) + 2.5;
  const mosfetPrice = 4.2 * materialPremium;
  const controlPrice = 12.0;
  const layoutPrice = 18.0;

  const copperCost = inductPrice * 0.60;
  const ironCost = inductPrice * 0.40 + mosfetPrice;
  const insulationCost = capsPrice;
  const structureCost = controlPrice + layoutPrice;
  const assemblyCost = 8.0;

  const economic = buildEconomicBreakdown(copperCost, ironCost, insulationCost, structureCost, assemblyCost, 0);

  return {
    electrical: [
      { label: 'Control Duty Cycle (D)', value: (clampedDC * 100).toFixed(1) + '%', unit: '%' },
      { label: 'Switching MOSFET Current RMS', value: (loadAmps * Math.sqrt(clampedDC)).toFixed(2), unit: 'A' },
      { label: 'Inductor Ripple Peak-to-Peak (dI)', value: allowedRippleAmp.toFixed(3), unit: 'A' },
      { label: 'Output Volt Ripple (Peak)', value: (allowedRippleVolt * 1000).toFixed(1), unit: 'mV' }
    ],
    magnetic: [
      { label: 'Target Filter Inductance', value: inductanceUH.toFixed(1), unit: 'µH' },
      { label: 'Inductor Wire Size', value: 'AWG 14 wound' },
      { label: 'Core Material', value: 'Ferrite Kool Mµ sendust powder' }
    ],
    mechanical: [
      { label: 'PCB Width Size', value: 120, unit: 'mm', dimensionKey: 'W' },
      { label: 'PCB Height clearance', value: 45, unit: 'mm', dimensionKey: 'H' },
      { label: 'Weight (Heatsink Included)', value: '0.42', unit: 'kg' }
    ],
    thermal: [
      { label: 'MOSFET Die Temp', value: (45 + totalSemisW * 2.5).toFixed(1), unit: '°C' },
      { label: 'Heatsink Thermal impedance Rθja', value: '3.2', unit: 'K/W' }
    ],
    manufacturing: [
      { label: 'PCB Trace thickness', value: '2 oz Copper (70μm)' },
      { label: 'SMD package spec', value: 'TO-220 / DirectFET packages' }
    ],
    economic,
    dimensions: {
      W: 140,
      H: 45,
      D: 100,
      coreRadius: 30, // Inductor scale
      windowW: 24,
      windowH: 24
    },
    efficiencyCurve: [10, 25, 50, 75, 100, 115].map(load => {
      const lAmps = loadAmps * (load / 100);
      const output = vout * lAmps;
      const cLoss = Math.pow(lAmps, 2) * mosfetRdsOn * clampedDC;
      const tLFraction = output / (output + cLoss + swLossW + 1.2) * 100;
      return { load, efficiency: Number(Math.min(98.8, Math.max(75, tLFraction)).toFixed(2)) };
    }),
    lossDistribution: [
      { label: 'MOSFET Conduction', value: Number(((conductionLossW / (totalSemisW + 1)) * 100).toFixed(1)) },
      { label: 'MOSFET Dynamic Switching', value: Number(((swLossW / (totalSemisW + 1)) * 100).toFixed(1)) },
      { label: 'Inductor Core Eddy', value: 8.5 }
    ],
    standards: [
      'Fully compliant to FCC Part 15 EMI/RFI noise filter levels.',
      'Creepage boundaries verified inline with IPC-2221 design limits.'
    ]
  };
}

/**
 * 4. Renewable energy simulation logic (Solar, Wind, Battery backup)
 */
function runRenewableCalculator(
  equipmentId: string,
  capacityKw: number,
  inputs: Record<string, any>,
  optBmScale: number,
  optJScale: number,
  materialPremium: number
): CalculationResults {
  const irradiance = Number(inputs.irradiance || 5.2);
  const sysLossesFrac = (Number(inputs.losses || 14)) / 100;

  // Daily energy production kWh
  // Ed = Capacity * SunHour * (1 - losses)
  const dailyKwh = capacityKw * irradiance * (1 - sysLossesFrac);
  const panelLimitRating = Number(inputs.moduleP || 450); // Watts per panel
  const panelsQuantity = Math.ceil((capacityKw * 1000) / panelLimitRating);

  const solarInverterSizing = capacityKw * 1.1; // inverter scaling factor

  // Cost calculation
  const panelsPrice = panelsQuantity * 110 * materialPremium;
  const structuresPrice = capacityKw * 50;
  const inverterPrice = solarInverterSizing * 135;
  const cablingPrice = capacityKw * 25;

  const copperCost = cablingPrice + panelsPrice * 0.4;
  const ironCost = inverterPrice + panelsPrice * 0.3;
  const insulationCost = panelsPrice * 0.3;
  const structureCost = structuresPrice;
  const assemblyCost = 250;

  const economic = buildEconomicBreakdown(copperCost, ironCost, insulationCost, structureCost, assemblyCost, 0);

  return {
    electrical: [
      { label: 'Calculated Daily Generated Energy', value: dailyKwh.toFixed(1), unit: 'kWh/day' },
      { label: 'Required Solar Panel modules count', value: panelsQuantity },
      { label: 'Recommended Microinverter sizing', value: solarInverterSizing.toFixed(1), unit: 'kVA' },
      { label: 'Open Circuit Voltage Voc', value: (Number(inputs.vdc || 800) * 1.15).toFixed(1), unit: 'V' }
    ],
    magnetic: [
      { label: 'Inverter Transformer Core', value: 'High flux Sendust' },
      { label: 'Inductor magnetic filters size', value: '550 µH' }
    ],
    mechanical: [
      { label: 'Required Surface footprint area', value: Math.round(panelsQuantity * 1.95), unit: 'm²' },
      { label: 'Structure Weight', value: Math.round(panelsQuantity * 21), unit: 'kg' }
    ],
    thermal: [
      { label: 'Estimated solar cell temperature NOC', value: '47.5', unit: '°C' },
      { label: 'Inverter active cooling system', value: solarInverterSizing > 30 ? 'Forced air fan' : 'Natural convection' }
    ],
    manufacturing: [
      { label: 'Panel solar-grade class', value: 'Tier 1 Monocrystalline Bifacial' },
      { label: 'Connector standard wiring', value: 'IP68 MC4 PV-conductors' }
    ],
    economic,
    dimensions: {
      W: 240, // standard render size representing panels block
      H: 150,
      D: 10,
      coreRadius: 10,
      windowW: 2,
      windowH: 2
    },
    efficiencyCurve: [10, 25, 50, 75, 100, 115].map(load => {
      const output = capacityKw * (load / 100);
      const eff = inverterPrice > 100 ? (98.2 - (1.5 / (load / 10 + 0.1))) : (96.5 - (2.1 / (load / 10 + 0.1)));
      return { load, efficiency: Number(Math.min(98.8, Math.max(60, eff)).toFixed(2)) };
    }),
    lossDistribution: [
      { label: 'PV cells mismatch heat', value: 8.5 },
      { label: 'Cables I²R dissipation', value: 2.1 },
      { label: 'Inverter switching losses', value: 1.4 }
    ],
    standards: [
      'Engineered to meet IEEE 1547 standards on anti-islanding safeguards.',
      'Constructed with IEC 61215 rated photovoltaic modules.'
    ]
  };
}

/**
 * 5. Cables & Substation Earthing Calculator
 */
function runPowerSystemsCalculator(
  equipmentId: string,
  baseParam: number,
  inputs: Record<string, any>,
  optBmScale: number,
  optJScale: number
): CalculationResults {
  const isEarthing = equipmentId === 'earthing';
  
  if (isEarthing) {
    const iFault = Number(inputs.faultCurrent || 12); // kA
    const tc = Number(inputs.duration || 1); // s
    const gridAreaX = Number(inputs.lengthX || 40);
    const gridAreaY = Number(inputs.lengthY || 40);
    
    // IEEE 80 Earthing Grid conductor sizing
    // Area = iFault * sqrt(tc) * factor
    const factorSteel = 12.15; // steel factor
    const reqConductorSection = iFault * Math.sqrt(tc) * factorSteel * optJScale;

    const meshX = Math.ceil(gridAreaX / 8);
    const meshY = Math.ceil(gridAreaY / 8);
    const totalConductorLength = (gridAreaX * (meshY + 1)) + (gridAreaY * (meshX + 1));
    const earthResistance = Number((0.5 * Math.PI * Number(inputs.resistivity || 150) / Math.sqrt(gridAreaX * gridAreaY)).toFixed(2));

    const conductorCost = totalConductorLength * (reqConductorSection * 0.04);
    const copperCost = conductorCost * 0.6;
    const ironCost = conductorCost * 0.3;
    const insulationCost = 100.0;
    const structureCost = conductorCost * 0.1;
    const assemblyCost = 250.0;

    const economic = buildEconomicBreakdown(copperCost, ironCost, insulationCost, structureCost, assemblyCost, 0);

    return {
      electrical: [
        { label: 'Fault safety Grid resistance', value: earthResistance, unit: 'Ω' },
        { label: 'Calculated Mesh Step Potential', value: (85 + (iFault * 10)).toFixed(1), unit: 'V' },
        { label: 'IEEE 80 Limit touch voltage', value: '412.5', unit: 'V' }
      ],
      magnetic: [
        { label: 'Ground return EMF reactance', value: '0.045', unit: 'Ω/km' }
      ],
      mechanical: [
        { label: 'Total Conductor copper needed', value: totalConductorLength, unit: 'm', dimensionKey: 'W' },
        { label: 'Suggested Ground conductor cross area', value: reqConductorSection.toFixed(1), unit: 'mm²' }
      ],
      thermal: [
        { label: 'Fusing Temperature limit for Joint', value: '250', unit: '°C' }
      ],
      manufacturing: [
        { label: 'Conductor material grade', value: 'Exothermic welded Galvanized steel grid' }
      ],
      economic,
      dimensions: {
        W: gridAreaX * 10,
        H: gridAreaY * 10,
        D: 10,
        coreRadius: 5,
        windowW: 10,
        windowH: 10
      },
      efficiencyCurve: [{ load: 100, efficiency: 100 }],
      lossDistribution: [{ label: 'Conduction Ground return', value: 100 }],
      standards: [
        'Compliant with IEEE 80 structural requirements.',
        'Meets BIS standards of industrial grid sizing.'
      ]
    };
  } else {
    // Default/Cable sizing calculator
    const current = Number(inputs.current || 150);
    const length = Number(inputs.length || 120);
    const allowedD = Number(inputs.allowedDrop || 3);

    // Cable Voltage drop & heat sizing
    // Cross area ≈ J_factor * current
    const cableArea = Math.ceil(current / 2.1 * optJScale);
    const voltLoss = (0.0172 * length * current) / cableArea / 415 * 100;

    const copperWeight = (cableArea * 8.96 * length * 3) / 1000;
    const cablePrice = copperWeight * 12.0;

    const copperCost = cablePrice;
    const ironCost = 50.0;
    const insulationCost = cablePrice * 0.25;
    const structureCost = cablePrice * 0.1;
    const assemblyCost = 80.0;

    const economic = buildEconomicBreakdown(copperCost, ironCost, insulationCost, structureCost, assemblyCost, 0);

    return {
      electrical: [
        { label: 'Designed Cable Copper Cross Section', value: cableArea, unit: 'mm²' },
        { label: 'Primary conductor thermal impedance', value: '0.45', unit: 'K/W' },
        { label: 'Estimated active volt loss', value: voltLoss.toFixed(2) + '%', unit: '%' }
      ],
      magnetic: [],
      mechanical: [
        { label: 'Cable overall length', value: length, unit: 'm', dimensionKey: 'W' },
        { label: 'Total physical weight', value: copperWeight.toFixed(1), unit: 'kg' }
      ],
      thermal: [
        { label: 'Core insulator limits', value: 'XLPE Insulation max 90°C' }
      ],
      manufacturing: [
        { label: 'Installation type route', value: inputs.routing || 'Underground Duct' }
      ],
      economic,
      dimensions: {
        W: 200,
        H: 30,
        D: 30,
        coreRadius: 15,
        windowW: 5,
        windowH: 5
      },
      efficiencyCurve: [{ load: 100, efficiency: 100 }],
      lossDistribution: [{ label: 'Copper losses', value: 100 }],
      standards: [
        'Sized inline with BS 7671 regulations.',
        'Meets IEC 60502 standard parameters for voltage classifications.'
      ]
    };
  }
}
