import re

def fix_file(path, old_import, new_import, names):
    with open(path, 'r') as f:
        content = f.read()
    
    # Remove all single imports
    for name in names:
        content = re.sub(r"import\s*{\s*"+name+r"\s*}\s*from\s*'[^']+';\n", "", content)
    
    # Add combined import
    names_str = ", ".join(names)
    content = f"import {{ {names_str} }} from '{new_import}';\n" + content
    
    with open(path, 'w') as f:
        f.write(content)

fix_file('src/api/modules/branch/controllers/BranchController.ts',
    "",
    "../../../../application/usecases/organization/BranchUseCases",
    ["CreateBranchUseCase", "UpdateBranchAddressUseCase", "DeactivateBranchUseCase", "DeleteBranchUseCase", "GetBranchByIdUseCase", "GetAllBranchesUseCase"]
)

fix_file('src/api/modules/organization/controllers/OrganizationController.ts',
    "",
    "../../../../application/usecases/organization/OrganizationUseCases",
    ["CreateOrganizationUseCase", "DeactivateOrganizationUseCase", "DeleteOrganizationUseCase", "GetOrganizationByIdUseCase", "GetAllOrganizationsUseCase"]
)
