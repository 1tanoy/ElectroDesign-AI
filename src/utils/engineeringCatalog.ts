/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategorySpec } from '../types';

export const categoriesCatalog: CategorySpec[] = [
  {
    id: 'transformers',
    name: 'Transformers',
    description: 'Core, Shell, Power, Distribution, Auto & Ferrite Transformers',
    icon: 'Transformer',
    equipments: [
      {
        id: 'core_type',
        name: 'Core Type Transformer',
        description: 'Single-phase or three-phase dual-winding core-type transformer.',
        defaultInputs: { power: 100, vPrimary: 11000, vSecondary: 415, freq: 50, phase: 3, cooling: 'ONAN' },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kVA', min: 1, max: 100000, step: 1 },
          { key: 'vPrimary', label: 'Primary Voltage', type: 'number', unit: 'V', min: 110, max: 220000, step: 10 },
          { key: 'vSecondary', label: 'Secondary Voltage', type: 'number', unit: 'V', min: 12, max: 33000, step: 1 },
          { key: 'freq', label: 'Frequency', type: 'number', unit: 'Hz', min: 10, max: 1000, step: 1 },
          { key: 'phase', label: 'Phase Count', type: 'select', options: ['1', '3'] },
          { key: 'cooling', label: 'Cooling Method', type: 'select', options: ['AN (Air Natural)', 'AF (Air Forced)', 'ONAN', 'ONAF', 'OFAF'] }
        ]
      },
      {
        id: 'shell_type',
        name: 'Shell Type Transformer',
        description: 'Shell type where windings are surrounded by the magnetic core.',
        defaultInputs: { power: 50, vPrimary: 2400, vSecondary: 240, freq: 60, phase: 1, cooling: 'AN (Air Natural)' },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kVA', min: 0.5, max: 5000, step: 0.5 },
          { key: 'vPrimary', label: 'Primary Voltage', type: 'number', unit: 'V', min: 110, max: 66000 },
          { key: 'vSecondary', label: 'Secondary Voltage', type: 'number', unit: 'V', min: 12, max: 415 },
          { key: 'freq', label: 'Frequency', type: 'number', unit: 'Hz', min: 25, max: 400 },
          { key: 'phase', label: 'Phase Count', type: 'select', options: ['1', '3'] },
          { key: 'cooling', label: 'Cooling Method', type: 'select', options: ['AN (Air Natural)', 'AF (Air Forced)', 'ONAN'] }
        ]
      },
      {
        id: 'power_tx',
        name: 'Power Transformer',
        description: 'Large high-voltage grids connection transformer (>5 MVA).',
        defaultInputs: { power: 25000, vPrimary: 132000, vSecondary: 11000, freq: 50, phase: 3, cooling: 'ONAF' },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kVA', min: 5000, max: 500000 },
          { key: 'vPrimary', label: 'Primary Voltage', type: 'number', unit: 'V', min: 33000, max: 500000 },
          { key: 'vSecondary', label: 'Secondary Voltage', type: 'number', unit: 'V', min: 3300, max: 132000 },
          { key: 'freq', label: 'Frequency', type: 'number', unit: 'Hz', min: 50, max: 60 },
          { key: 'phase', label: 'Phase Count', type: 'select', options: ['3'] },
          { key: 'cooling', label: 'Cooling Method', type: 'select', options: ['ONAN', 'ONAF', 'OFAF', 'OFWF'] }
        ]
      },
      {
        id: 'distribution_tx',
        name: 'Distribution Transformer',
        description: 'Utility line distribution down to customer voltages.',
        defaultInputs: { power: 250, vPrimary: 11000, vSecondary: 433, freq: 50, phase: 3, cooling: 'ONAN' },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kVA', min: 10, max: 2500 },
          { key: 'vPrimary', label: 'Primary Voltage', type: 'number', unit: 'V', min: 3300, max: 33000 },
          { key: 'vSecondary', label: 'Secondary Voltage', type: 'number', unit: 'V', min: 110, max: 600 },
          { key: 'freq', label: 'Frequency', type: 'number', unit: 'Hz', min: 50, max: 60 },
          { key: 'phase', label: 'Phase Count', type: 'select', options: ['3', '1'] },
          { key: 'cooling', label: 'Cooling Method', type: 'select', options: ['ONAN', 'KNAN', 'AN (Air Natural)'] }
        ]
      },
      {
        id: 'isolation_tx',
        name: 'Isolation Transformer',
        description: '1:1 ratio safety isolation transformer.',
        defaultInputs: { power: 10, vPrimary: 230, vSecondary: 230, freq: 50, phase: 1, cooling: 'AN (Air Natural)' },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kVA', min: 0.1, max: 250 },
          { key: 'vPrimary', label: 'Primary Voltage', type: 'number', unit: 'V', min: 110, max: 480 },
          { key: 'vSecondary', label: 'Secondary Voltage', type: 'number', unit: 'V', min: 110, max: 480 },
          { key: 'freq', label: 'Frequency', type: 'number', unit: 'Hz', min: 50, max: 400 },
          { key: 'phase', label: 'Phase Count', type: 'select', options: ['1', '3'] },
          { key: 'cooling', label: 'Cooling Method', type: 'select', options: ['AN (Air Natural)', 'AF (Air Forced)'] }
        ]
      },
      {
        id: 'auto_tx',
        name: 'Auto Transformer',
        description: 'Single continuous winding with taped connection points.',
        defaultInputs: { power: 15, vPrimary: 415, vSecondary: 240, freq: 50, phase: 3, cooling: 'AN (Air Natural)' },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kVA', min: 1, max: 500 },
          { key: 'vPrimary', label: 'Primary Input', type: 'number', unit: 'V', min: 100, max: 1000 },
          { key: 'vSecondary', label: 'Secondary Output', type: 'number', unit: 'V', min: 50, max: 1000 },
          { key: 'freq', label: 'Frequency', type: 'number', unit: 'Hz', min: 50, max: 60 },
          { key: 'phase', label: 'Phase Count', type: 'select', options: ['3', '1'] },
          { key: 'cooling', label: 'Cooling Method', type: 'select', options: ['AN (Air Natural)', 'AF (Air Forced)', 'ONAN'] }
        ]
      },
      {
        id: 'instrument_tx',
        name: 'Instrument Transformer',
        description: 'CTs and VTs for secondary metering and protective relays.',
        defaultInputs: { power: 0.05, vPrimary: 11000, vSecondary: 110, freq: 50, phase: 1, cooling: 'AN (Air Natural)' },
        inputSchema: [
          { key: 'power', label: 'Burden Rating', type: 'number', unit: 'kVA', min: 0.005, max: 2, step: 0.001 },
          { key: 'vPrimary', label: 'Primary Voltage Level', type: 'number', unit: 'V', min: 110, max: 220000 },
          { key: 'vSecondary', label: 'Secondary Ratio Volts', type: 'number', unit: 'V', min: 100, max: 120 }
        ]
      },
      {
        id: 'ferrite_tx',
        name: 'Ferrite / SMPS Transformer',
        description: 'High-frequency switched ferrite core transformer.',
        defaultInputs: { power: 0.25, vPrimary: 310, vSecondary: 12, freq: 100000, phase: 1, cooling: 'AN (Air Natural)' },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kW', min: 0.01, max: 50, step: 0.01 },
          { key: 'vPrimary', label: 'DC Bus Voltage', type: 'number', unit: 'V', min: 12, max: 800 },
          { key: 'vSecondary', label: 'Secondary Voltage', type: 'number', unit: 'V', min: 1.2, max: 100 },
          { key: 'freq', label: 'Frequency', type: 'number', unit: 'kHz', min: 10, max: 1000, step: 10 }
        ]
      }
    ]
  },
  {
    id: 'ac_machines',
    name: 'AC Machines',
    description: 'Induction & Synchronous Motors, Generators and Alternators',
    icon: 'Activity',
    equipments: [
      {
        id: 'induction_3p',
        name: 'Three Phase Induction Motor',
        description: 'Standard squirrel cage three-phase industrial motor.',
        defaultInputs: { power: 15, voltage: 415, freq: 50, poles: 4, efficiency: 91, pf: 0.86 },
        inputSchema: [
          { key: 'power', label: 'Power Output', type: 'number', unit: 'kW', min: 0.37, max: 1000, step: 0.1 },
          { key: 'voltage', label: 'Stator Voltage', type: 'number', unit: 'V', min: 110, max: 11000 },
          { key: 'freq', label: 'Stator Frequency', type: 'number', unit: 'Hz', min: 25, max: 120 },
          { key: 'poles', label: 'Number of Poles', type: 'select', options: ['2', '4', '6', '8', '12'] },
          { key: 'efficiency', label: 'Target Efficiency', type: 'number', unit: '%', min: 70, max: 98 },
          { key: 'pf', label: 'Power Factor Range', type: 'number', unit: 'cos φ', min: 0.6, max: 0.98, step: 0.01 }
        ]
      },
      {
        id: 'induction_1p',
        name: 'Single Phase Induction Motor',
        description: 'Split-phase or capacitor run single phase motor.',
        defaultInputs: { power: 1.5, voltage: 230, freq: 50, poles: 4, efficiency: 75, type: 'Capacitor Start' },
        inputSchema: [
          { key: 'power', label: 'Power Output', type: 'number', unit: 'kW', min: 0.05, max: 7.5, step: 0.05 },
          { key: 'voltage', label: 'Input Voltage', type: 'number', unit: 'V', min: 110, max: 240 },
          { key: 'poles', label: 'Poles', type: 'select', options: ['2', '4', '6'] },
          { key: 'type', label: 'Start Method', type: 'select', options: ['Capacitor Start', 'Capacitor Run', 'Split Phase', 'Shaded Pole'] }
        ]
      },
      {
        id: 'synchronous_motor',
        name: 'Synchronous Motor',
        description: 'Constant speed double excited AC motor.',
        defaultInputs: { power: 150, voltage: 6600, freq: 50, poles: 4, pf: 1 },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kW', min: 5, max: 10000 },
          { key: 'voltage', label: 'Stator Voltage', type: 'number', unit: 'V', min: 220, max: 15000 },
          { key: 'poles', label: 'Poles', type: 'select', options: ['2', '4', '6', '8', '16', '32'] },
          { key: 'pf', label: 'Excitation PF', type: 'number', unit: 'cos φ', min: 0.5, max: 1 }
        ]
      },
      {
        id: 'synchronous_gen',
        name: 'Synchronous Generator / Alternator',
        description: 'Grid-connected alternator for utility thermal/hydro power.',
        defaultInputs: { power: 5000, voltage: 11000, freq: 50, poles: 4, efficiency: 97 },
        inputSchema: [
          { key: 'power', label: 'Rating Capacity', type: 'number', unit: 'kVA', min: 100, max: 1000000 },
          { key: 'voltage', label: 'Generated Volts', type: 'number', unit: 'V', min: 415, max: 24000 },
          { key: 'poles', label: 'Poles config', type: 'select', options: ['2 (Turbo)', '4 (Medium)', '10 (Hydro)', '24 (Water)'] },
          { key: 'freq', label: 'Grid Frequency', type: 'number', unit: 'Hz', min: 50, max: 60 }
        ]
      }
    ]
  },
  {
    id: 'dc_machines',
    name: 'DC Machines',
    description: 'Series, Shunt, Compound and Separately Excited DC Motors',
    icon: 'Cpu',
    equipments: [
      {
        id: 'dc_series',
        name: 'DC Series Motor',
        description: 'High starting torque traction DC motor.',
        defaultInputs: { power: 10, voltage: 220, speed: 1500, efficiency: 85 },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kW', min: 0.5, max: 500 },
          { key: 'voltage', label: 'Line Voltage', type: 'number', unit: 'V', min: 12, max: 750 },
          { key: 'speed', label: 'Rated Speed', type: 'number', unit: 'RPM', min: 500, max: 5000, step: 50 },
          { key: 'efficiency', label: 'Target Efficiency', type: 'number', unit: '%', min: 65, max: 96 }
        ]
      },
      {
        id: 'dc_shunt',
        name: 'DC Shunt Motor',
        description: 'Constant speed shunt wound industrial motor.',
        defaultInputs: { power: 7.5, voltage: 230, speed: 1440, efficiency: 86 },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kW', min: 0.1, max: 250 },
          { key: 'voltage', label: 'Armature Voltage', type: 'number', unit: 'V', min: 24, max: 600 },
          { key: 'speed', label: 'Base Speed', type: 'number', unit: 'RPM', min: 300, max: 3600 }
        ]
      },
      {
        id: 'separating_dc',
        name: 'Separately Excited DC Motor',
        description: 'Independent field excitation DC motor commonly used in precision drives.',
        defaultInputs: { power: 22, voltage: 440, speed: 1800, vField: 220 },
        inputSchema: [
          { key: 'power', label: 'Power', type: 'number', unit: 'kW', min: 1, max: 1000 },
          { key: 'voltage', label: 'Armature Volts', type: 'number', unit: 'V', min: 110, max: 1000 },
          { key: 'speed', label: 'Rated Speed', type: 'number', unit: 'RPM', min: 100, max: 4000 },
          { key: 'vField', label: 'Field Voltage', type: 'number', unit: 'V', min: 12, max: 300 }
        ]
      }
    ]
  },
  {
    id: 'modern_motors',
    name: 'Modern Motors',
    description: 'BLDC, PMSM, Switched Reluctance & EV Traction Motors',
    icon: 'Gauge',
    equipments: [
      {
        id: 'bldc',
        name: 'BLDC Motor',
        description: 'Brushless DC PM motor with electronic commutation.',
        defaultInputs: { power: 2, voltage: 48, speed: 3000, poles: 8, magnet: 'NdFeB (N42)' },
        inputSchema: [
          { key: 'power', label: 'Power Rating', type: 'number', unit: 'kW', min: 0.1, max: 100, step: 0.1 },
          { key: 'voltage', label: 'DC Link Voltage', type: 'number', unit: 'V', min: 12, max: 800 },
          { key: 'speed', label: 'Rated Speed', type: 'number', unit: 'RPM', min: 500, max: 20000 },
          { key: 'poles', label: 'Rotor Pole Count', type: 'select', options: ['4', '6', '8', '10', '12', '14'] },
          { key: 'magnet', label: 'Magnet Material', type: 'select', options: ['NdFeB (N42)', 'NdFeB (N52)', 'SmCo', 'Ferrite Y30'] }
        ]
      },
      {
        id: 'pmsm',
        name: 'PMSM Motor',
        description: 'Permanent Magnet Synchronous Motor with sinusoidal back-EMF.',
        defaultInputs: { power: 60, voltage: 380, speed: 4500, poles: 8, mount: 'Interior Magnet' },
        inputSchema: [
          { key: 'power', label: 'Rated Power', type: 'number', unit: 'kW', min: 1, max: 500 },
          { key: 'voltage', label: 'AC Supply (rms)', type: 'number', unit: 'V', min: 48, max: 690 },
          { key: 'speed', label: 'Peak Speed', type: 'number', unit: 'RPM', min: 1000, max: 15000 },
          { key: 'mount', label: 'Magnet Mount Type', type: 'select', options: ['Surface Mount (SPM)', 'Interior Magnet (IPM)'] }
        ]
      },
      {
        id: 'switched_reluctance',
        name: 'Switched Reluctance Motor',
        description: 'Magnet-free robust rotor reluctance machine.',
        defaultInputs: { power: 11, voltage: 415, speed: 3000, configuration: '8 / 6 poles' },
        inputSchema: [
          { key: 'power', label: 'Power output', type: 'number', unit: 'kW', min: 0.5, max: 250 },
          { key: 'voltage', label: 'DC bus peak', type: 'number', unit: 'V', min: 24, max: 700 },
          { key: 'configuration', label: 'Stator/Rotor Poles', type: 'select', options: ['6 / 4 poles', '8 / 6 poles', '12 / 8 poles'] }
        ]
      },
      {
        id: 'ev_traction',
        name: 'EV Traction Motor',
        description: 'High torque density premium EV powertrain drive (e.g. Tesla style IPMSM).',
        defaultInputs: { power: 150, voltage: 400, speed: 12000, torque: 350, coolant: 'Water-Glycol' },
        inputSchema: [
          { key: 'power', label: 'Peak Power', type: 'number', unit: 'kW', min: 40, max: 600 },
          { key: 'voltage', label: 'Pack Voltage', type: 'number', unit: 'V', min: 300, max: 900 },
          { key: 'speed', label: 'Max Rotor Velocity', type: 'number', unit: 'RPM', min: 6000, max: 22000 },
          { key: 'torque', label: 'Max Launch Torque', type: 'number', unit: 'Nm', min: 100, max: 1000 },
          { key: 'coolant', label: 'thermal fluid', type: 'select', options: ['Water-Glycol Jacket', 'Direct Oil Cooled Rotor', 'Air Cooled'] }
        ]
      }
    ]
  },
  {
    id: 'power_electronics',
    name: 'Power Electronics',
    description: 'Buck, Boost, Flyback Converters, VFDs and SMPS Power Supplies',
    icon: 'Radio',
    equipments: [
      {
        id: 'buck',
        name: 'Buck Converter',
        description: 'Step-down switching DC-DC converter.',
        defaultInputs: { vin: 24, vout: 12, iout: 5, freq: 100, rippleV: 1, rippleI: 10 },
        inputSchema: [
          { key: 'vin', label: 'Input Voltage', type: 'number', unit: 'V', min: 3, max: 800 },
          { key: 'vout', label: 'Output Voltage', type: 'number', unit: 'V', min: 1, max: 600 },
          { key: 'iout', label: 'Max Output Current', type: 'number', unit: 'A', min: 0.1, max: 500, step: 0.1 },
          { key: 'freq', label: 'Switching Frequency', type: 'number', unit: 'kHz', min: 10, max: 2000, step: 10 },
          { key: 'rippleV', label: 'Allowed Output Ripple', type: 'number', unit: '%', min: 0.1, max: 10, step: 0.1 },
          { key: 'rippleI', label: 'Allowed Inductor ripple', type: 'number', unit: '%', min: 5, max: 40 }
        ]
      },
      {
        id: 'boost',
        name: 'Boost Converter',
        description: 'Step-up switching DC-DC converter.',
        defaultInputs: { vin: 12, vout: 48, iout: 3, freq: 150, rippleV: 1, rippleI: 15 },
        inputSchema: [
          { key: 'vin', label: 'Input Voltage', type: 'number', unit: 'V', min: 1.5, max: 400 },
          { key: 'vout', label: 'Output Voltage', type: 'number', unit: 'V', min: 5, max: 1000 },
          { key: 'iout', label: 'Max Load Current', type: 'number', unit: 'A', min: 0.1, max: 200 },
          { key: 'freq', label: 'Frequency', type: 'number', unit: 'kHz', min: 20, max: 1000 }
        ]
      },
      {
        id: 'flyback',
        name: 'Flyback Converter',
        description: 'Isolated buck-boost converter with primary transformer coupling.',
        defaultInputs: { vin: 310, vout: 5, iout: 2, freq: 65, turnsRatio: 30 },
        inputSchema: [
          { key: 'vin', label: 'DC Input Bus', type: 'number', unit: 'V', min: 12, max: 800 },
          { key: 'vout', label: 'DC Output isolated', type: 'number', unit: 'V', min: 3.3, max: 100 },
          { key: 'iout', label: 'Rated Amps', type: 'number', unit: 'A', min: 0.1, max: 25 },
          { key: 'freq', label: 'Switching Freq', type: 'number', unit: 'kHz', min: 25, max: 500 }
        ]
      },
      {
        id: 'vfd',
        name: 'Variable Frequency Drive (VFD)',
        description: 'V/F speed control industrial AC inverter.',
        defaultInputs: { power: 11, voltage: 415, dcBus: 580, carrier: 8, phase: 3 },
        inputSchema: [
          { key: 'power', label: 'Rating Load Capacity', type: 'number', unit: 'kW', min: 0.75, max: 500 },
          { key: 'voltage', label: 'AC Grid Volts', type: 'number', unit: 'V', min: 200, max: 690 },
          { key: 'dcBus', label: 'Calculated DC Link', type: 'number', unit: 'V', min: 280, max: 1000 },
          { key: 'carrier', label: 'Carrier Frequency', type: 'number', unit: 'kHz', min: 2, max: 20 }
        ]
      }
    ]
  },
  {
    id: 'renewable_energy',
    name: 'Renewable Systems',
    description: 'Solar PV Arrays, Grid Solar Inverters, Wind Generators & Power Walls',
    icon: 'Sun',
    equipments: [
      {
        id: 'solar_pv',
        name: 'Solar PV Power Plant',
        description: 'Multi-megawatt grid-connected or rooftop solar arrays.',
        defaultInputs: { capacity: 100, irradiance: 5.2, vdc: 800, moduleP: 450, losses: 14 },
        inputSchema: [
          { key: 'capacity', label: 'Target AC Capacity', type: 'number', unit: 'kW', min: 1, max: 100000 },
          { key: 'irradiance', label: 'Solar Irradiance', type: 'number', unit: 'kWh/m²/day', min: 2, max: 8, step: 0.1 },
          { key: 'vdc', label: 'Selected String Volts', type: 'number', unit: 'V', min: 100, max: 1500 },
          { key: 'moduleP', label: 'Module Peak Power', type: 'number', unit: 'W', min: 250, max: 700, step: 5 },
          { key: 'losses', label: 'Assumed System Loss', type: 'number', unit: '%', min: 5, max: 30, step: 0.5 }
        ]
      },
      {
        id: 'wind_energy',
        name: 'Wind Energy Turbine System',
        description: 'Wind turbine generator with pitch and yaw controller simulation.',
        defaultInputs: { windSpeed: 12, rotorD: 80, cp: 0.42, genEff: 92 },
        inputSchema: [
          { key: 'windSpeed', label: 'Rated Wind Speed', type: 'number', unit: 'm/s', min: 3, max: 25, step: 0.1 },
          { key: 'rotorD', label: 'Rotor Diameter', type: 'number', unit: 'm', min: 10, max: 200 },
          { key: 'cp', label: 'Power Coefficient (Cp)', type: 'number', unit: 'max 0.59', min: 0.1, max: 0.59, step: 0.01 },
          { key: 'genEff', label: 'Gen Efficiency', type: 'number', unit: '%', min: 70, max: 98 }
        ]
      },
      {
        id: 'battery_storage',
        name: 'Battery Energy Storage System (BESS)',
        description: 'Lithium-ion industrial battery backup energy storage system.',
        defaultInputs: { power: 100, capacityKwh: 400, depth: 80, batteryV: 400 },
        inputSchema: [
          { key: 'power', label: 'Power Output', type: 'number', unit: 'kW', min: 1, max: 10000 },
          { key: 'capacityKwh', label: 'Battery Capacity', type: 'number', unit: 'kWh', min: 5, max: 50000 },
          { key: 'depth', label: 'Depth of Discharge', type: 'number', unit: '%', min: 20, max: 100 },
          { key: 'batteryV', label: 'System DC Voltage', type: 'number', unit: 'V', min: 24, max: 1000 }
        ]
      }
    ]
  },
  {
    id: 'power_systems',
    name: 'Power Systems',
    description: 'Substation Layouts, Safety Earthing grids, lightning protection, Cable & Busbars sizing',
    icon: 'Shield',
    equipments: [
      {
        id: 'cable_sizing',
        name: 'Cable Sizing Calculator',
        description: 'Industrial LV/HV cable thermal & voltage drop sizing.',
        defaultInputs: { current: 150, length: 120, allowedDrop: 3, voltage: 415, phase: 3, routing: 'Underground Duct' },
        inputSchema: [
          { key: 'current', label: 'Design Current', type: 'number', unit: 'A', min: 1, max: 3000 },
          { key: 'length', label: 'Cable Path Length', type: 'number', unit: 'm', min: 5, max: 10000 },
          { key: 'allowedDrop', label: 'Max Voltage Loss', type: 'number', unit: '%', min: 0.5, max: 10, step: 0.1 },
          { key: 'voltage', label: 'Line Volts', type: 'number', unit: 'V', min: 110, max: 132000 },
          { key: 'routing', label: 'Installation Type', type: 'select', options: ['Underground Duct', 'Direct Buried', 'Air Ladder', 'Conduit'] }
        ]
      },
      {
        id: 'earthing',
        name: 'Substation Earthing Grid',
        description: 'IEEE 80 earthing security loop grid conductor sizes.',
        defaultInputs: { faultCurrent: 12, duration: 1, resistivity: 150, lengthX: 40, lengthY: 40 },
        inputSchema: [
          { key: 'faultCurrent', label: 'Fault Current Level', type: 'number', unit: 'kA', min: 1, max: 100 },
          { key: 'duration', label: 'Fault Duration', type: 'number', unit: 's', min: 0.1, max: 3, step: 0.1 },
          { key: 'resistivity', label: 'Soil Resistivity', type: 'number', unit: 'Ω·m', min: 5, max: 10000 },
          { key: 'lengthX', label: 'Grid Width X', type: 'number', unit: 'm', min: 5, max: 500 },
          { key: 'lengthY', label: 'Grid Length Y', type: 'number', unit: 'm', min: 5, max: 500 }
        ]
      },
      {
        id: 'lightning_protection',
        name: 'Lightning Shield Design',
        description: 'Rolling sphere standard protective lightning rods configuration.',
        defaultInputs: { height: 25, flashDensity: 4, class: 'Class I (High)' },
        inputSchema: [
          { key: 'height', label: 'Structure Height', type: 'number', unit: 'm', min: 2, max: 400 },
          { key: 'flashDensity', label: 'Lightning Strike Density', type: 'number', unit: 'mag/km²/yr', min: 0.1, max: 50, step: 0.1 },
          { key: 'class', label: 'Protection Class', type: 'select', options: ['Class I (High)', 'Class II (Standard)', 'Class III (Basic)'] }
        ]
      }
    ]
  }
];
