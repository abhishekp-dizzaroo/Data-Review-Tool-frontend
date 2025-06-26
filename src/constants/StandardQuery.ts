// export const StandardQuery = {
//     'Patient Disposition': [
//         'Summarize frequency count for treatment discontinuation',
//         'Cross verify reasons of discontinuation to respective pages',
//     ],
    
//     'AE/CM': [
//         'Any AE with action taken as medication given should have CM reported',
        
//     ],

//     'AE/Dosing': [
//        'Any AE with action taken as medication given should have dose modification reported',
//     ],

//     'Baseline Characterstics': [
        
//     ],

//     'I/E Criteria': [
//         'Review MH relavant to MH (Protocol dependent)'
//     ],

//     'RECIST Assessment': [
        
//     ],

//     'AE/MH': [
//         "All the AE's related to MH should be reported as worsening of MH condition",
//         "Review all AE terms to determine if they represent the baseline medical history",
//         "All AE's reported before first dose should be reported as MH unless related to study specific procedures",
//         "Create a table where start date of an AE is before first dose, also print medical history table for the respective patient",
//         "Review the AE table and respective medical history table to check of any AE listed in table are reported in MH or not and report accordingly",
//     ],

//     'ECG': [
//         'Any ECG labled as abnormal and clinically significant after date of first dosing should be reported on AE page',
//         'Any ECG labled as abnormal and clinically significant before date of dosing should be reported on MH page',
//     ],

//     'Lab/AE Page': [
//         'All Lab abnormalities with clinical significance should be reported as AE',
        
//     ],

//     'Prior Therapies': [
//         'Ensure lines of prior therapy are logical - Regimen Number, Agent, Number of Cycles, Treatment Duration ',
//     ],

//     'AE': [
//         "For AE with Grade = 5  or Outcome = fatal: (1) Ensure there is only one such AE (2) Outcome is fatal but none of the CTCAE Grade = 5(3) Death Form recorded"
//     ]
// }


export const StandardQuery = {
    'Disposition Checks': [
        {
            query: 'Reconcile death dates across all domains',
            context: "Tables: ADSL, AE, DS, SV. Cross‑check ADSL.DTHDT, fatal AEs (AEOUT='FATAL'), and death records in DS (DSDECOD='DEATH'). List any conflicting or multiple death dates per USUBJID."
        },
        {
            query: 'Summarize reasons for treatment and study discontinuation',
            context: "Table: DS. Generate summary table by DS.DSCAT ('TREATMENT', 'STUDY') and DSDECOD for reason. Show frequencies and percentages."
        },
        {
            query: "If treatment discontinued due to AE, ensure AE exists with matching reason",
            context: "Tables: DS, AE. For DS.DSCAT='TREATMENT' and DSDECOD='ADVERSE EVENT', check for AE record where AEACN includes 'DRUG WITHDRAWN' or similar and AEOUT aligns temporally."
        },
        {
            query: "If discontinued due to disease progression, confirm PD on response page",
            context: "Tables: DS, ADRS. For DSDECOD='DISEASE PROGRESSION', check ADRS for corresponding PARAMCD='OVRINV' and AVALC='PD' with a date prior to or on DS.DSDTC. Flag mismatches."
        },
        {
            query: "If discontinued due to withdrawal of consent, confirm no conflicting AE or PD",
            context: "Tables: DS, AE, ADRS. For DSDECOD='WITHDRAWAL OF CONSENT', ensure no recent SAE or PD assessment just before discontinuation. Flag cases with inconsistency."
        },
        {
            query: "Check timing of discontinuation-related events",
            context: "Tables: DS, AE, ADRS. Ensure dates for AEs, PD, or other related events (AESTDTC, CNSDT, etc.) are ≤ DS.DSDTC. Flag if the event occurred after discontinuation date."
        },
        {
            query: "For discontinuation due to death, validate AE and date consistency",
            context: "Tables: DS, AE, ADSL. For DSDECOD='DEATH', confirm AE with AEOUT='FATAL' and AESTDTC = ADSL.DTHDT = DS.DSDTC. Report any date discrepancies."
        }
    ],
    'Patient Disposition': [
        {
            query: 'Summarize frequency count for treatment discontinuation',
            context: 'Summarize patient count for those who discontinued treatment with reasons.'
        },
        {
            query: 'Cross verify reasons of discontinuation to respective pages',
            context: 'Ensure discontinuation reasons match across eCRF pages.'
        }
    ],

    'AE/CM': [
        {
            query: 'Any AE with action taken as medication given should have CM reported',
            context: 'Verify that for any AE where medication was administered, corresponding Concomitant Medication (CM) records exist.'
        }
    ],

    'AE/Dosing': [
        {
            query: 'Any AE with action taken as medication given should have dose modification reported',
            context: 'Check that dose modifications are documented when AEs required medical intervention.'
        }
    ],

    'Baseline Characterstics': [
        // No queries provided, keeping empty array
    ],

    'I/E Criteria': [
        {
            query: 'Review MH relavant to MH (Protocol dependent)',
            context: 'Review medical history for relevance according to inclusion/exclusion criteria as per protocol.'
        }
    ],

    'RECIST Assessment': [
        // No queries provided, keeping empty array
    ],

    'AE/MH': [
        {
            query: "All the AE's related to MH should be reported as worsening of MH condition",
            context: 'Ensure that AE records related to pre-existing MH conditions are marked as worsening.'
        },
        {
            query: "Review all AE terms to determine if they represent the baseline medical history",
            context: 'Compare AE terms with baseline MH to identify overlaps.'
        },
        {
            query: "All AE's reported before first dose should be reported as MH unless related to study specific procedures",
            context: 'Pre-dose AEs should be documented as MH unless caused by study-specific interventions.'
        },
        {
            query: "Create a table where start date of an AE is before first dose, also print medical history table for the respective patient",
            context: 'Extract AEs starting before first dose and cross-check with MH records.'
        },
        {
            query: "Review the AE table and respective medical history table to check of any AE listed in table are reported in MH or not and report accordingly",
            context: 'Verify consistency between AE and MH data for pre-dose events.'
        }
    ],

    'ECG': [
        {
            query: 'Any ECG labled as abnormal and clinically significant after date of first dosing should be reported on AE page',
            context: 'Post-dosing abnormal ECGs with clinical significance should be captured in AE records.'
        },
        {
            query: 'Any ECG labled as abnormal and clinically significant before date of dosing should be reported on MH page',
            context: 'Pre-dosing abnormal ECGs should be documented as part of MH.'
        }
    ],

    'Lab/AE Page': [
        {
            query: 'All Lab abnormalities with clinical significance should be reported as AE',
            context: 'Clinically significant lab abnormalities must have corresponding AE entries.'
        }
    ],

    'Prior Therapies': [
        {
            query: 'Ensure lines of prior therapy are logical - Regimen Number, Agent, Number of Cycles, Treatment Duration',
            context: 'Verify the consistency and logic of prior therapy data.'
        }
    ],

    'AE': [
        {
            query: "For AE with Grade = 5  or Outcome = fatal: (1) Ensure there is only one such AE (2) Outcome is fatal but none of the CTCAE Grade = 5(3) Death Form recorded",
            context: 'Check AE records for fatal outcomes and CTCAE grading consistency; ensure Death Form exists where applicable.'
        }
    ]
}
