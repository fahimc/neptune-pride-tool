var GameCalculators = {
    TerraformingCalc() {
        var intTerraformingLevel = $("#txtTerraformingLevel").val();
        var intNaturalResources = $("#txtNaturalResources").val();
        var intTerraformedResources = 0;
        var error = false;
    
        //Initialization
        $("#lblTerraformingLevel").html("");
        $("#txtTerraformingLevel").removeClass("error");
        $("#lblNaturalResources").html("");
        $("#txtNaturalResources").removeClass("error");
        $("#txtTerraformedResources").val("");
    
    
        //Validation
        if (isNaN(parseInt(intTerraformingLevel)) != true) {
            intTerraformingLevel = parseInt(intTerraformingLevel);
        } else {
            //Error report
            $("#lblTerraformingLevel").html("Must be an Integer. Must be above 0.");
            $("#txtTerraformingLevel").addClass("error");
            error = true;
        }
    
        if (isNaN(parseInt(intNaturalResources)) != true) {
            intNaturalResources = parseInt(intNaturalResources);
        } else {
            //Error report
            $("#lblNaturalResources").html("Must be an Integer. Must be above 0.");
            $("#txtNaturalResources").addClass("error");
            error = true;
        }
    
        if (error == false) {
            intTerraformedResources = (intTerraformingLevel * 5) + intNaturalResources;
            $("#txtTerraformedResources").val(intTerraformedResources);
        }
    
    },
    ExperimentationCalc() {
        var intExperimentationLevel = $("#txtExperimentationLevel").val();
        var intResearchBonus = 0;
    
        //Initialization
        $("#lblExperimentationLevel").html("");
        $("#txtExperimentationLevel").removeClass("error");
        $("#txtResearchBonus").val("");
    
        //Validation
        if (isNaN(parseInt(intExperimentationLevel)) != true) {
            intExperimentationLevel = parseInt(intExperimentationLevel);
            intResearchBonus = intExperimentationLevel * 72;
            $("#txtResearchBonus").val(intResearchBonus);
        } else {
            //Error report
            $("#txtExperimentationLevel").html("Must be an Integer. Must be above 0.");
            $("#txtExperimentationLevel").addClass("error");
    
        }
    
    },
    BankingCalc() {
        var intBankingLevel = $("#txtBankingLevel").val();
        var intIncomeBonus = 0;
    
        //Initialization
        $("#lblBankingLevel").html("");
        $("#txtBankingLevel").removeClass("error");
        $("#txtIncomeBonus").val("");
    
        //Validation
        if (isNaN(parseInt(intBankingLevel)) != true) {
            intBankingLevel = parseInt(intBankingLevel);
            intIncomeBonus = intBankingLevel * 75;
            $("#txtIncomeBonus").val(intIncomeBonus);
        } else {
            //Error report
            $("#txtBankingLevel").html("Must be an Integer. Must be above 0.");
            $("#txtBankingLevel").addClass("error");
    
        }
    
    },
    ManufacturingCalc() {
        var intManufacturingLevel = $("#txtManufacturingLevel").val();
        var intStarIndustry = $("#txtStarIndustry").val();
        var intShipsPerHour = 0;
        var error = false;
    
        //Initialization
        $("#lblManufacturingLevel").html("");
        $("#txtManufacturingLevel").removeClass("error");
        $("#lblStarIndustry").html("");
        $("#txtStarIndustry").removeClass("error");
        $("#txtShipsPerHour").val("");
    
    
        //Validation
        if (isNaN(parseInt(intManufacturingLevel)) != true) {
            intManufacturingLevel = parseInt(intManufacturingLevel);
        } else {
            //Error report
            $("#lblManufacturingLevel").html("Must be an Integer. Must be above 0.");
            $("#txtManufacturingLevel").addClass("error");
            error = true;
        }
    
        if (isNaN(parseInt(intStarIndustry)) != true) {
            intStarIndustry = parseInt(intStarIndustry);
        } else {
            //Error report
            $("#lblStarIndustry").html("Must be an Integer. Must be above 0.");
            $("#txtStarIndustry").addClass("error");
            error = true;
        }
    
        if (error == false) {
            intShipsPerHour = (intStarIndustry * (intManufacturingLevel + 5)) / 24;
            intShipsPerHour = intShipsPerHour.toFixed(2);
            $("#txtShipsPerHour").val(intShipsPerHour);
        }
    
    }
};