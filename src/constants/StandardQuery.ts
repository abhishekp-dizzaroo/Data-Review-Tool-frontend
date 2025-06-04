export const StandardQuery = {
    'Patient Disposition': [
        'Summarize frequency count for treatment discontinuation',
        'Cross verify reasons of discontinuation to respective pages',
    ],
    
    'AE/CM': [
        'Any AE with action taken as medication given should have CM reported',
        
    ],

    'AE/Dosing': [
       'Any AE with action taken as medication given should have dose modification reported',
    ],

    'Baseline Characterstics': [
        
    ],

    'I/E Criteria': [
        'Review MH relavant to MH (Protocol dependent)'
    ],

    'RECIST Assessment': [
        
    ],

    'AE/MH': [
        "All the AE's related to MH should be reported as worsening of MH condition",
        "Review all AE terms to determine if they represent the baseline medical history",
        "All AE's reported before first dose should be reported as MH unless related to study specific procedures",
        "Create a table where start date of an AE is before first dose, also print medical history table for the respective patient",
        "Review the AE table and respective medical history table to check of any AE listed in table are reported in MH or not and report accordingly",
    ],

    'ECG': [
        'Any ECG labled as abnormal and clinically significant after date of first dosing should be reported on AE page',
        'Any ECG labled as abnormal and clinically significant before date of dosing should be reported on MH page',
    ],

    'Lab/AE Page': [
        'All Lab abnormalities with clinical significance should be reported as AE',
        
    ],

    'Prior Therapies': [
        'Ensure lines of prior therapy are logical - Regimen Number, Agent, Number of Cycles, Treatment Duration ',
    ],

    'AE': [
        "For AE with Grade = 5  or Outcome = fatal: (1) Ensure there is only one such AE (2) Outcome is fatal but none of the CTCAE Grade = 5(3) Death Form recorded"
    ]
}