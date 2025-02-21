// let Customize = {};

// /* Locations */

// Customize.DisplayLocations = function() {
//     let locations = Customize.data.locations;
//     let addLocationHtml = `
//         <div class="add-location">
//             <i class="fas fa-plus"></i>
//             <div>Add New Location</div>
//         </div>
//     `;
//     for (let i=0; i<locations.length; i++) {
//         let locationEntryHtml = `
//             <div class="location-entry">                
//                 <div class="location-name">${_L("custom_location_"+locations[i].locationType)}</div>
//                 <div class="location-id">
//                     <div>Location ID: ${locations[i].id}</div>
//                 </div>
//                 <div class="location-options">
//                     <i class="fas fa-edit edit-location"></i>
//                     <i class="fas fa-trash"></i>
//                 </div>   
//             </div>
//         `;
//         addLocationHtml += locationEntryHtml;
//     }
//     let elem = $("#app-customize > .customize-container > .sidebar");
//     elem.removeClass();
//     elem.addClass("sidebar");
//     elem.addClass("locations");
//     elem.html(addLocationHtml);
//     elem.fadeIn(250).css("display", "flex");
// }

// Customize.SelectLocationType = function(locationType) {
//     if (locationType == "management") {
//         return Customize.AddLocation();
//     }
//     if (locationType == "crafting") {
//         return Customize.AddLocation();
//     }
//     if (locationType == "storage") {
//         return Customize.AddLocation();
//     if (locationType == "billing") return Customize.AddLocation();
//     if (locationType == "market") return Customize.AddLocation();
// }

// Customize.AddLocation = function(data) {
//     if (data != undefined) {
//         data = {};
//     }
//     let optionsHtml = "";
//     let locationTypes = [
//         {
//             value: "management",
//             label: "Management"
//         },
//         {
//             value: "crafting",
//             label: "Crafting"
//         },
//         {
//             value: "storage",
//             label: "Storage"
//         },
//         {
//             value: "billing",
//             label: "Billing"
//         },
//         {
//             value: "market",
//             label: "Market"
//         },
//     ];
//     let locationSelected = "crafting";
//     let locationTypesHtml =  "";
//     for (i=0;i<locationTypes.length; i++) {
//         locationTypesHtml += `<option value="${locationTypes[i].value}" ${(locationSelected != null && locationSelected == locationTypes[i].value) ? "selected" : ""}>${locationTypes[i].label}</option>`
//     }
//     optionsHtml += `
//         <div>
//             <div class="option-name">Location Type:</div>
//             <div class="option-value">
//                 <select class="option-location-type">
//                     ${locationTypesHtml}
//                 </select>
//             </div>
//         </div>
//     `;
//     let editLocationHtml = `
//         <div class="return-locations">
//             <i class="fas fa-arrow-left"></i>
//             <div>BACK</div>
//         </div>
//         <div class="location">
//             <div class="location-options">
//                 ${optionsHtml}
//             </div>
//             <div class="location-actions">
//                 <div class="save-location">
//                     <i class="fas fa-save"></i>
//                     <div>Create Location</div>
//                 </div>
//             </div>
//         </div>
//     `;
//     let elem = $("#app-customize > .customize-container > .sidebar");
//     elem.removeClass();
//     elem.addClass("sidebar");
//     elem.addClass("create-location");
//     elem.html(editLocationHtml);
//     elem.fadeIn(250).css("display", "flex");

//     $('#app-customize > .customize-container > .sidebar.edit-location .return-locations').on('click', function(event) {
//         Customize.CloseSidebar(function() {
//             Customize.DisplayLocations();
//         });
//     });

//     $('#app-customize > .customize-container > .sidebar.create-location .option-location-type').on('change', function(event) {
//         let locationType = $(this).val();
//         if (locationType == null || locationSelected == locationType) return;
//         Customize.SelectLocationType(locationType);
//         $('#app-customize > .customize-container > .sidebar.create-location .location-options').html(optionsHtml);
//     });

//     $('#app-customize > .customize-container > .sidebar.create-location .save-location').on('click', function(event) {
//         let locationType = $('#app-customize > .customize-container > .sidebar.create-location .option-location-type').val();
//         let location = {
//             id: Customize.data.locations.length+1,
//             locationType: locationType,
//             position: {
//                 coords: {x: 0, y: 0, z: 0}
//             }
//         }
//         Customize.data.locations.push(location);
//         Customize.CloseSidebar(function() {
//             Customize.DisplayLocations();
//         });
//     });
// }

// Customize.EditLocationPosition = function(id, location) {
// }

// Customize.EditLocationEntity = function(id, location) {
// }

// Customize.EditLocation = function(id, data) {
//     let location = Customize.data.locations.find(location => location.id == id);
//     if (!location) return;
//     if (data != undefined) {
//         location = data;
//     }
//     let optionsHtml = "";
//     optionsHtml += `
//         <div class="option-position">
//             <div class="option-name">${_L("custom_location_option_position")}:</div>
//             <div class="option-value">${_L("custom_location_option_position_value", location.position.coords.x, location.position.coords.y, location.position.coords.z)}</div>
//             <div class="option-edit"><i class="fas fa-edit"></i></div>
//         </div>
//     `;
//     if (location.model != undefined) {
//         let furniture = Customize.GetFurnitureByModel(location.model);
//         if (furniture) {
//             optionsHtml += `
//                 <div class="option-entity">
//                     <div class="option-name">${_L("custom_location_option_model")}:</div>
//                     <div class="option-value">${furniture.label}</div>
//                     <div class="option-edit"><i class="fas fa-edit"></i></div>
//                 </div>
//             `;
//         }
//     }
//     let editLocationHtml = `
//         <div class="return-locations">
//             <i class="fas fa-arrow-left"></i>
//             <div>BACK</div>
//         </div>
//         <div class="location">
//             <div class="location-options">
//                 <div>
//                     <div class="option-name">Location Type:</div>
//                     <div class="option-value">${_L("custom_location_"+location.locationType)}</div>
//                 </div>
//                 <div>
//                     <div class="option-name">Location ID:</div>
//                     <div class="option-value">${id}</div>
//                 </div>
//                 ${optionsHtml}
//             </div>
//             <div class="location-actions">
//                 <div class="save-location">
//                     <i class="fas fa-save"></i>
//                     <div>Save Changes</div>
//                 </div>
//             </div>
//         </div>
//     `;
//     let elem = $("#app-customize > .customize-container > .sidebar");
//     elem.removeClass();
//     elem.addClass("sidebar");
//     elem.addClass("edit-location");
//     elem.html(editLocationHtml);
//     elem.fadeIn(250).css("display", "flex");

//     $('#app-customize > .customize-container > .sidebar.edit-location .option-edit').on('click', function(event) {
//         let option = $(this).parent().attr("class").split(" ")[0].split("-")[1];
//         switch (option) {
//             case "position": {
//                 Customize.EditLocationPosition(id, location);
//                 break;
//             }
//             case "entity": {
//                 Customize.EditLocationEntity(id, location);
//                 break;
//             }
//             default: {
//                 break;
//             }
//         }
//     });

//     $('#app-customize > .customize-container > .sidebar.edit-location .return-locations').on('click', function(event) {
//         Customize.CloseSidebar(function() {
//             Customize.DisplayLocations();
//         });
//     });
// }

// /* Furniture */


// Customize.DisplayFurniture = function() {
//     let furnitureLocations = Customize.data.furnitureLocations;
//     let addFurnitureHtml = `
//         <div class="add-location">
//             <i class="fas fa-plus"></i>
//             <div>Add New Furniture</div>
//         </div>
//     `;
//     for (let i=0; i<furnitureLocations.length; i++) {
//         let furniture = Customize.GetFurnitureByModel(furnitureLocations[i].model);
//         let locationEntryHtml = `
//             <div class="location-entry">                
//                 <div class="location-name">${furniture.label}</div>
//                 <div class="location-id">
//                     <div>Furniture ID: ${furnitureLocations[i].id}</div>
//                 </div>
//                 <div class="location-options">
//                     <i class="fas fa-edit edit-furniture"></i>
//                     <i class="fas fa-trash"></i>
//                 </div>   
//             </div>
//         `;
//         addFurnitureHtml += locationEntryHtml;
//     }
//     let elem = $("#app-customize > .customize-container > .sidebar");
//     elem.removeClass();
//     elem.addClass("sidebar");
//     elem.addClass("furnitureLocations");
//     elem.html(addFurnitureHtml);
//     elem.fadeIn(250).css("display", "flex");
// }

// Customize.GetFurnitureByModel = function(model) {
//     return Customize.data.furniture.find(furniture => furniture.model == model);
// }

// Customize.EditFurniturePosition = function(id, location) {
// }

// Customize.EditFurnitureEntity = function(id, location) {
// }

// Customize.EditFurniture = function(id, data) {
//     let location = Customize.data.furnitureLocations.find(location => location.id == id);
//     if (!location) return;
//     let furniture = Customize.GetFurnitureByModel(location.model);
//     if (!furniture) return;
//     if (data != undefined) {
//         location = data;
//     }
//     let optionsHtml = "";
//     optionsHtml += `
//         <div class="option-position">
//             <div class="option-name">${_L("custom_furniture_option_position")}:</div>
//             <div class="option-value">${_L("custom_furniture_option_position_value", location.position.coords.x, location.position.coords.y, location.position.coords.z)}</div>
//             <div class="option-edit"><i class="fas fa-edit"></i></div>
//         </div>
//     `;
//     let editFurnitureHtml = `
//         <div class="return-furnitureLocations">
//             <i class="fas fa-arrow-left"></i>
//             <div>BACK</div>
//         </div>
//         <div class="location">
//             <div class="location-options">
//                 <div>
//                     <div class="option-name">Furniture ID:</div>
//                     <div class="option-value">${id}</div>
//                 </div>
//                 <div class="option-entity">
//                     <div class="option-name">${_L("custom_furniture_option_model")}:</div>
//                     <div class="option-value">${furniture.label}</div>
//                 </div>
//                 ${optionsHtml}
//             </div>
//             <div class="location-actions">
//                 <div class="save-location">
//                     <i class="fas fa-save"></i>
//                     <div>Save Changes</div>
//                 </div>
//             </div>
//         </div>
//     `;
//     let elem = $("#app-customize > .customize-container > .sidebar");
//     elem.removeClass();
//     elem.addClass("sidebar");
//     elem.addClass("edit-furniture");
//     elem.html(editFurnitureHtml);
//     elem.fadeIn(250).css("display", "flex");

//     $('#app-customize > .customize-container > .sidebar.edit-furniture .option-edit').on('click', function(event) {
//         let option = $(this).parent().attr("class").split(" ")[0].split("-")[1];
//         switch (option) {
//             case "position": {
//                 Customize.EditFurniturePosition(id, location);
//                 break;
//             }
//             case "entity": {
//                 Customize.EditFurnitureEntity(id, location);
//                 break;
//             }
//             default: {
//                 break;
//             }
//         }
//     });

//     $('#app-customize > .customize-container > .sidebar.edit-furniture .return-furnitureLocations').on('click', function(event) {
//         Customize.CloseSidebar(function() {
//             Customize.DisplayFurniture();
//         });
//     });
// }

// /* Main */

// Customize.Open = function(data) {
//     Customize.data = data;
//     // Customize.DisplayLocations(1);
//     Customize.AddLocation();
// }

// Customize.CloseSidebar = function(callback) {
//     let elem = $("#app-customize > .customize-container > .sidebar");
//     elem.fadeOut(250, function() {
//         elem.html("");
//         setTimeout(() => {
//             if (callback) callback();
//         }, 1);
//     });
// }

// $(document).ready(function() {
//     Language = {
//         "custom_location_management": "Management",
//         "custom_location_option_position": "Position",
//         "custom_location_option_position_value": "vector3(%s, %s, %s)",
//         "custom_location_option_model": "Furniture Model",
        
//         "custom_furniture_option_position": "Position",
//         "custom_furniture_option_position_value": "vector3(%s, %s, %s)",
//         "custom_furniture_option_model": "Furniture Model",
//     }

//     $('#app-customize').on('click', '.customize-container > .header > div', function(event) {
//         let index = $(this).index();
//         $('#app-customize > .customize-container > .header > div').removeClass("active");
//         $('#app-customize > .customize-container > .header > div').eq(index).addClass("active");
//         Customize.CloseSidebar(function() {
//             switch (index) {
//                 case 0: {
//                     Customize.DisplayLocations();
//                     break;
//                 }
//                 case 1: {
//                     Customize.DisplayFurniture();
//                     break;
//                 }
//                 default: {
//                     break;
//                 }
//             }
//         });
//     });

//     $('#app-customize').on('click', '.sidebar.locations .edit-location', function(event) {
//         let index = $(this).parent().parent().index();
//         Customize.CloseSidebar(function() {
//             Customize.EditLocation(index);
//         });
//     });

    
//     $('#app-customize').on('click', '.sidebar.furnitureLocations .edit-furniture', function(event) {
//         let index = $(this).parent().parent().index();
//         Customize.CloseSidebar(function() {
//             Customize.EditFurniture(index);
//         });
//     });

//     Customize.Open({
//         furniture:  [
//             {
//                 label: "Chair 1",
//                 model: "prop_chair",
//                 price: 100,
//             }
//         ],
//         furnitureLocations: [
//             {
//                 id: 1,
//                 model: "prop_chair",
//                 position: {
//                     coords: {x: -1000.49, y: -9000.49, z: -2000.49}
//                 }
//             }
//         ],
//         locations: [
//             {
//                 id: 1,
//                 locationType: "management",
//                 model: "prop_chair",
//                 position: {
//                     coords: {x: -1000.49, y: -9000.49, z: -2000.49}
//                 }
//             }
//         ]
//     });


// });