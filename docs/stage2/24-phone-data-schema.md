# phone data schema

Prepared October 4, 2026. Local release; deployment confirmation is not recorded.

Schema v1: {id, name, region, verified, fields, support}. Every field is {value, source, checked, confidence}; missing values are null with confidence=not verified. Support preserves commitment, starting-event description, exact endDate and policy source separately.

Fields include body height/width/depth/weight, diagonal/resolution/SoC/storage, RAM and typical battery where checked. Regional model number, launch/current OS, measured battery/brightness/charging, repairability, SIM, connectivity, camera testing and prices are nullable slots. A populated nullable schema is not a claim that all requested evidence is available.

Sources and regions: Apple published specifications; Google UK cohort; Samsung Canada cohort. Values are not merged across regional models. Support end dates stay null. Never sort null as zero.

Runtime dataset: /data/phones-v1.json and /api/v1/phones.json. Source module: scripts/phone-data.cjs.
