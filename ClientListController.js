(function () {

var app = angular.module("Client");

var ClientListController = function ($scope, localizationService, $location, $compile) {
$scope.SelectedOffice = null;
$scope.Resize = function () {
try {
$('#clientsGrid').height($(window).height() - 140);
$scope.clientsGrid.resize();
}
catch (e)
{ }
};

$scope.EditClient = function (clientId) {
$scope.SaveGridState();
$location.path("/client/" + clientId);
};

$scope.SaveGridState = function () {
localStorage["Client-list"] = kendo.stringify($scope.clientsGrid.getOptions());
};

$scope.SetGridState = function () {
var options = localStorage["Client-list"];
if (options) {
var options = JSON.parse(options);
options.columns[3].template = kendo.template($('#clientsGridControlTemplate').html());
$scope.clientsGrid.setOptions(options);
}
$scope.clientsGrid.dataSource.read();
$scope.clientsGrid.refresh();
};

$scope.SelectedOfficeHasChanged = function () {
$scope.RefreshGrid();
}

$scope.RefreshGrid = function () {
$scope.clientsGrid.dataSource._page = 1;
$scope.clientsGrid.dataSource._skip = 0;
$scope.clientsGrid.dataSource.read();
$scope.clientsGrid.refresh();
};
$scope.clientsGridOptions = {
dataSource: {
type: "odata",
dataType: "json",
serverFiltering: true,
serverPaging: true,
serverSorting: true,
pageSize: 50,
transport: {
read: {
url: baseUrl + "api/Client/GetAll/",
dataType: "json",
},
parameterMap: function (options, operation) {
if (operation == "read") {
var paramMap = kendo.data.transports.odata.parameterMap(options);
delete paramMap.$format;
paramMap.officeId = $scope.SelectedOffice;
return paramMap;
}
else if (operation !== "read" && options.models) {
return { models: kendo.stringify(options.models) };
}
}
},
schema: {
data: function (data) {
return data.Items;
},
total: function (data) {
return data.Count;
}
}
},
sortable: true,
pageable: true,
filterable: true,
autoBind: false,
selectable: "single",
height: 250,
columns: [
{ field: "Id", type: "string", title: "{{Localization.ColumnClientId}}", width: "60px" },
{ field: "Name", type: "string", title: "{{Localization.ColumnName}}", width: 120 },
{ field: "Address1", type: "string", title: "{{Localization.ColumnAddress}}", width: 120 },
{
field: "IsActive", type: "boolean", title: "{{Localization.ColumnIsActive}}", width: "60px", attributes: { "style": "text-align:center;" },
template: '<input type="checkbox" #= IsActive ? \'checked="checked"\' : "" # disabled="disabled" />'
},
{field: "Controls",
title: " ",
template: kendo.template($('#ClientGridControlTemplate').html()),
width: "30px",
filterable: false,
sortable: false,
}]
};
$scope.InitGrid = function () {
$scope.SetGridState();
$scope.clientsGrid.thead.kendoTooltip({
filter: "th",
content: function (e) {
var target = e.target; // element for which the tooltip is shown
return $(target).text();
}
});
$("#clientsGrid").on("dblclick", "tr.k-state-selected", function () {
var grid = $scope.clientsGrid;
var selectedItem = grid.dataItem(grid.select());
$scope.$apply($scope.EditClient(selectedItem.Id));
});
$(window).resize($scope.Resize).trigger("resize");
};
$scope.init = function (values, ressourceType) {
$.extend($scope, values);
localizationService.getForType(ressourceType).then(function (data) {
$scope.Localization = data;
$scope.InitGrid();});
};
}
app.controller("ClientListController", ['$scope', 'localizationService', '$location', '$compile', ClientListController]);
}());
