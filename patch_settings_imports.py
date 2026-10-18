import re

with open('src/api/modules/settings/SettingsModule.ts', 'r') as f:
    content = f.read()

content = content.replace("'../../ApiModuleRegistration'", "'../ApiModuleRegistration'")
content = content.replace("'../../../routing/RouteRegistry'", "'../../routing/RouteRegistry'")
content = content.replace("'../../../../application/settings/usecases/SettingsUseCases'", "'../../../application/settings/usecases/SettingsUseCases'")
content = content.replace("'../../../security/SecurityPipeline'", "'../../security/SecurityPipeline'")

with open('src/api/modules/settings/SettingsModule.ts', 'w') as f:
    f.write(content)
