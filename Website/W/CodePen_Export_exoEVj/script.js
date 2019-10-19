$( document ).ready(function() {
    console.log( "ready!" );
});


$('#results').toggle();

document.getElementById("calc-btn").addEventListener("click", function(){
  getCalcInput();
  $('#results').toggle();
  disableCalcs();
  event.preventDefault();//stop from submitting to page
});




function disableCalcs(){
  $("#mrn-input, #inr-input, #weight-input, #orderedDose-input").prop("readonly", true);
    $("#dosing-input").prop("disabled", true);
  $("#calc-btn").prop('disabled', true);
}


  jQuery("#calc-btn").prop('disabled', true);
  var toValidate = jQuery('#mrn-input, #inr-input, #weight-input, #dosing-input, #orderedDose-input'),
    valid = false;
toValidate.keyup(function () {
    if (jQuery(this).val().length > 0) {
        jQuery(this).data('valid', true);
    } else {
        jQuery(this).data('valid', false);
    }
    toValidate.each(function () {
        if (jQuery(this).data('valid') == true) {
            valid = true;
        } else {
            valid = false;
        }
    });
    if (valid === true) {
        jQuery("#calc-btn").prop('disabled', false);
    } else {
        jQuery("#calc-btn").prop('disabled', true);
    }
});


document.getElementById("reset-btn").addEventListener("click", function(){
 document.getElementById("calc-form").reset();
 $("#error-banner").empty();
  $('form').removeClass('was-validated');
  $("tr.vials-breakdown").empty();
  $(".totalCorrectedDose").empty();
  $(".totalCorrectedVol").empty();
  jQuery("#calc-btn").prop('disabled', true);
  $('#results').hide();
});


function getCalcInput(){
  var dosing = $('#dosing-input').val();
  var orderedDose =$('#orderedDose-input').val();
  var weight = $('#weight-input').val();
  var inr = $('#inr-input').val();
  var mrn = $('#mrn-input').val();
  var numOfVials = numOfVialsf(orderedDose);
  var maxedDose =  maxDose(dosing);
jQuery.ajax({
        url: "https://towerhealth.trhmc.org/provider/pharmacy/dept/_api/web/lists/getByTitle('kcentra')/items",
        type: "GET",
	async: 'false',
  	    headers: { 
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            //"content-length": <length of post body>,
            //"X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function(result){
		      var data = [];
		      for (var i = 0; i < result.d.results.length; i++){
		         var resultObj = {lot: result.d.results[i].Title, units:result.d.results[i].Units,    qty:result.d.results[i].Number_x0020_of_x0020_Vials};
		data.push(resultObj);

			}
	},
	error: function(result){
		console.log("failure:" + result);
		}
	});
  
 
  
  var chosenInv = getInventory(orderedDose, numOfVials, dosing,data); //returns an inventory obj
  var chosenDose = newDose(chosenInv);
  var chosenVol = newVol(chosenInv);
  var dt = new Date();
  var time= dt.getMonth()+"/"+dt.getDate()+"/"+dt.getFullYear()+" "+dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
 


  if (chosenDose >= maxedDose){
    while (chosenDose > maxedDose){
    numOfVials -= 1;
    chosenInv = getInventory(orderedDose, numOfVials , dosing, data);
      chosenDose = newDose(chosenInv);
      chosenVol = newVol(chosenInv);
    }
    console.log(chosenInv);
  }
  var product = finalProduct(chosenDose, chosenVol,chosenInv,mrn,inr, weight, dosing,orderedDose,time);
 //var test =JSON.parse(product);
  //console.log(test);
displayValues(product);
 
 document.getElementById("SPsubmit").addEventListener("click", function(){
   console.log(JSON.parse(product));
/***var listName = "testKcentraLog"
var siteURL = "https://towerhealth.trhmc.org/provider/pharmacy/dept"
var title = "testing";
createListItemWithDetails(listName, siteUrl, title, product['MRN'], product['vials'],product['INR'],product['Weight'],product['Dosing'],product['RoundedDose'],product['chosenDose'], product['totalVol'], product['chosenInv'], product['CalcTime'], console.log, console.log);
  event.preventDefault();//stop from submitting to page
***/});
  
  $('form').addClass('was-validated');
  
  if (orderedDose > maxDose){
    var errorText = `Rounded  Dose exceeds the Max Dose of ${maxDose} IU, based on the selected dosing of ${dosing}`;
    
    showWarning(errorText);
  }
  if (inr < 2){
    var errorText = `An INR less than 2 is not usual (*NEEDS WORDING CHANGED)`;
    showCaution(errorText);
}
  if (inrDoseCheck(inr,dosing) != dosing){
    var expectedDosing = inrDoseCheck(inr,dosing);
    var errorText = `Expected ${expectedDosing} dosing  based on an INR input of ${inr}; Selected ${dosing}`;
    showCaution(errorText);
  };
  
  if (roundDose(dosing, weight) != orderedDose){
    var expectedDose = roundDose(dosing, weight);
    var errorText = `Expected a Rounded dose of ${expectedDose} IU; Entered: ${orderedDose} IU`;
    showCaution(errorText);
  };
  //console.log(maxDose(dosing));
  
};

function showCaution(errorText){
 $('#error-banner').prepend(`<div class="alert alert-warning" role="alert">
  <strong>CAUTION:</strong> ${errorText}</div>`);
}
function showWarning(errorText){
 $('#error-banner').prepend(`<div class="alert alert-danger" role="alert">
  <strong>WARNING:</strong> ${errorText}</div>`);
}

function getDosing(orderedDose, dosing, inr, weight){
//retrieves the input values 
//gives error if data not entered
//calls maxDose(dosing) to determine max dose to selected dosing value
//calls roundDose(orderedDose) to determine the new dose based on dosing selected
//calls numofVials(roundedDose) based on what roundDose() returns
//calls getInventory() to see what is available
//calls chooseInventory() to queue what inventory of kcentra should be used
//calls displayValues() to insert table with calculated information, submit, print etc

};

function inrDoseCheck(inr,dosing){
//returns an error if inr and dosing don't match
 inr = parseFloat(inr);
  var dosing = dosing;
  
  if (inr >= 2 && inr < 4){
    dosing = "25 IU/kg";
  }
  
  if(inr >= 4 && inr <=6){
    dosing = "35 IU/kg";
  }
  
  if(inr > 6){
    dosing = "50 IU/kg";
  }
  
  return dosing;
};

function orderedDoseCheck(dosing, weight){
  var dosingIU = 0;
  if (dosing == "25 IU/kg"){
    dosingIU = 25;
  }
  if (dosing == "35 IU/kg"){
    dosingIU = 35;
  }
  if (dosing == "50 IU/kg"){
    dosingIU = 50;
  }
  
  var calcOrderedDose = dosingIU * weight;
  return calcOrderedDose;
}


function roundDose(dosing,weight){
  //return  rounded dose  based on ordered dose
  var calcOrderedDose = orderedDoseCheck(dosing, weight);
  var roundedDose;
  
  if (calcOrderedDose <= 749){
    roundedDose = 500;
  }
  if (calcOrderedDose >749 && calcOrderedDose <= 1249){
    roundedDose = 1000;
  }
  if (calcOrderedDose > 1249 && calcOrderedDose <= 1750){
    roundedDose = 1500;
  }
  if (calcOrderedDose > 1749 && calcOrderedDose <= 2250){
    roundedDose = 2000;
  }
  if (calcOrderedDose > 2249 && calcOrderedDose <= 2750){
    roundedDose = 2500;
  }
  if (calcOrderedDose > 2749 && calcOrderedDose <= 3250){
    roundedDose = 3000;
  }
  if (calcOrderedDose > 3249 && calcOrderedDose <= 3750){
    roundedDose = 3500;
  }
   if (calcOrderedDose > 3749 && calcOrderedDose <= 4250){
    roundedDose = 4000;
  }
  if (calcOrderedDose > 4249 && calcOrderedDose <= 4750){
    roundedDose = 4500;
  }
   if (calcOrderedDose > 4749){
    roundedDose = 5000;
  }
  
  return roundedDose;
};


function numOfVialsf(roundedDose){
  //returns case of number of vials based on rounded dose
  var vialNum = roundedDose /  500;
  return vialNum;
};


function maxDose(dosing){
  
var maxDoseIU = 0;
  
  if (dosing == "25 IU/kg"){
    maxDoseIU = 2500;
  }
  if (dosing == "35 IU/kg"){
    maxDoseIU = 3500;
  }
  if (dosing == "50 IU/kg"){
    maxDoseIU = 5000;
  }
  
  return maxDoseIU;
  
 };





function getInventory(orderedDose, numOfVials, dosing,data){
  var dose = orderedDose;
  var MULTIPLE_LIMIT = numOfVials;
  var arr = [];
  var countLimit;

 for (var i = 0; i < data.length; i++){
   countLimit = data[i].qty;
    if (data[i].qty > MULTIPLE_LIMIT){
      countLimit = MULTIPLE_LIMIT;
    }
    console.log(countLimit);
    for (var j = 1; j <= countLimit; j++){
  //console.log("countLimit:"+countLimit);
      arr.push(parseInt(data[i].units));
      console.log(arr);
    }

  }
  arr = arr.slice(0, MULTIPLE_LIMIT)
  //takes units out of array based on countLimit
  //needs an if statement for maxDose
 
  var chosenInv = [];
  var counts = {};
for (var i = 0; i < arr.length; i++) {
    counts[arr[i]] = 1 + (counts[arr[i]] || 0);
}
  
  const keys = Object.keys(counts)
    for (const key of keys) {
     pos = data.map(function(e) { return e.units; }).indexOf(key);
      var totalqty = counts[key] * parseFloat(key);
      var holder = {
        "lot": data[pos].lot,
        "units": parseInt(key),
        "qty": counts[key],
        "totalUnitQty": totalqty,
        "volume": counts[key] * 20
      }
      chosenInv.push(holder);
      
  };
  
  return chosenInv;
 
 
}

function newDose(chosenInv){
  var unitTotal= 0;  
  for (var i = 0; i < chosenInv.length; i++){
    unitTotal += chosenInv[i].totalUnitQty;
  };  
  return unitTotal;
};

function newVol(chosenInv){
  var volTotal = 0;
  for (var i = 0; i < chosenInv.length; i++){
    volTotal += chosenInv[i].volume;
  };
return volTotal;
};

function finalProduct(chosenDose, chosenVol,chosenInv,mrn,inr, weight, dosing,orderedDose,time){
  
  var finalProduct = {
    "CalcTime": time,
   "MRN": mrn,
   "INR": inr,
   "Weight": weight,
  "Dosing": dosing,
   "RoundedDose":orderedDose,
   "units": chosenDose,
    "totalVol": chosenVol,
    "vials": chosenInv
  };
return finalProduct;
}

//LEFT OFF AN TRYING TO PULL ALL DATA INTO ONE OBJECT FOR DISPLAY FUNCTION AND STORE FUNCTION
//getInventory(5000,10);


//count each unique value
//match units to units of data obj
//create new obj with lots, units, and qty counted
//pass to display values for parsing

function displayValues(product){
  
 for (var i = 0;i < product['vials'].length;i++){
   var lot = product['vials'][i].lot;
   var units = product['vials'][i].units;
   var qty = product['vials'][i].qty;
   var totalUnits = product['vials'][i].totalUnitQty;
   var totalVol = product['vials'][i].volume;
   
   console.log(units);
  $("#results table tbody").prepend(
  `<tr class="vials-breakdown">
      <th scope="row">${lot}</th>
      <td>${units}</td>
      <td>${qty}</td>
      <td>20 mL</td>
      <td>${totalUnits}</td>
      <td>${totalVol} mL</td>
    </tr>
    `)
  };
  
  $("#results > p").html(`<small>Calculated by</small><small class = "text-muted"> NAME </small><small>@</small><small class="text-muted">${product.CalcTime}<small>`);
  $("#results > table > tbody > tr > td.totalCorrectedDose").html(`Total Units <br><strong><big>${product.units}</big></strong> Units`);
  $("#results > table > tbody > tr > td.totalCorrectedVol").html(`Total Volume <br><strong><big>${product.totalVol}</big></strong> mL`);
    
};
//parse finalProduct object

  function createListItemWithDetails(listName, siteUrl, title, mrn, vials,inr,weight,dosing,orderedDose,totalVol, kTime, CalcTime, newDose, success, failure) {
var vialsTable = "";
vialsThead = `<table class="table table-striped table-bordered">
  <thead>
    <tr>
      <th scope="col">Lot</th>
      <th scope="col">Units</th>
      <th scope="col">QTY</th>
      <th scope="col">Volume</th>
      <th scope="col">Total Units</th>
      <th scope="col">Total Volume</th>
    </tr>
  </thead>
	<tbody>
`;

for (var i = 0; i < product['vials'].length;i++){
	var lot = product['vials'][i].lot;
	var units = product['vials'][i].units;
	var qty = product['vials'][i].qty;
	var totalUnits = product['vials'][i].totalUnitQty;
	var totalVol = product['vials'][i].volume;

 	vialsTbody += `
      <th scope="row">${lot}</th>
      <td>${units}</td>
      <td>${qty}</td>
      <td>20 mL</td>
      <td>${totalUnits}</td>
      <td>${totalVol} mL</td>
    </tr>
`;
};
	var vialsTend = '</tbody>';

    var vialsTable= vialsThead + vialsTbody + vialsTend;
    var itemType = GetItemTypeForListName(listName);
    var item = {
        "__metadata": { "type": itemType },
        "Title": title,
	"MRN": mrn,
	"Vials": vialsTable,
	"Total Volume (mL)":totalVol,
	"Rounded Dose (Units)": orderedDose,
	"Time Kcentra Left Pharmacy": kTime,
	"Time of Calculation": CalcTime,
	"Weight": weight,
	"INR":inr,
	"New Dose (Units)": newDose,
//name columns here
    };
 
    jQuery.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure("FAILURE!!!! " +data);
        }
    });
}

function GetItemTypeForListName(name){return"SP.Data." + name.charAt(0).toUpperCase() + name.slice(1) + "ListItem";}