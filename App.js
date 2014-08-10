//rrr
Ext.define('LabRallyGrid', {
    extend: 'Rally.app.App',
    name: 'marketpert',
    componentCls: 'app',
    items: {
        html: '<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'
    },
    launch: function() {
        function _onDataStoreLoaded(store, data) {
            var stories = [],
                totalPert = 0;
            Ext.Array.each(data, function(story) {
                story.get("c_PERT") && (totalPert += story.get("c_PERT"));
                var s = {};
                s._ref = story.get("_ref"), fields.forEach(function(field) {
                    s[field] = story.get(field)
                }), stories.push(s)
            }, this);
            var totalsPanel = new Ext.form.Panel({
                    title: "Reports",
                    width: "100%",
                    margin: "10 0 10 0",
                    bodyPadding: 10,
                    renderTo: Ext.getBody(),
                    layout: {
                        type: "hbox",
                        align: "middle"
                    }
                }),
                pertLabel = new Ext.form.Label({
                    xtype: "label",
                    forId: "myFieldId",
                    text: "Pert: " + totalPert,
                    margins: "0 0 0 10"
                }),
                exportButton = new Rally.ui.Button({
                    xtype: "rallybutton",
                    text: "Export page",
                    margin: "10 10 10 10",
                    handler: function() {
                        _exportToCSV(rallyGrid)
                    }
                }),
                exportAllButton = new Rally.ui.Button({
                    xtype: "rallybutton",
                    text: "Export all data",
                    margin: "10 10 10 10",
                    handler: function() {
                        _exportAllToCSV(rallyGrid, stories)
                    }
                });
            totalsPanel.add(exportButton), totalsPanel.add(exportAllButton), totalsPanel.add(pertLabel), this.add(totalsPanel), Rally.data.ModelFactory.getModel({
                type: "User Story",
                success: _onModelRetrieved,
                scope: this
            })
        }

        function _onModelRetrieved(storyModel) {
            rallyGrid = new Rally.ui.grid.Grid({
                xtype: "rallygrid",
                model: storyModel,
                columnCfgs: fields,
                pagingToolbarCfg: {
                    pageSizes: [10, 25, 50, 200]
                },
                storeConfig: {
                    pageSize: 10,
                    context: this.getContext().getDataContext()
                }
            }), this.add(rallyGrid)
        }

        function _exportToCSV(grid) {
            var text = _getHeaderData(grid);
            text += _getPageRows(grid), window.location = "data:text/csv;charset=utf8," + encodeURIComponent(text)
        }

        function _exportAllToCSV(grid, records) {
            var text = _getHeaderData(grid);
            text += _getAllRows(records), window.location = "data:text/csv;charset=utf8," + encodeURIComponent(text)
        }

        function _getHeaderData(grid) {
            var cols = grid.columns,
                data = "";
            return Ext.Array.each(cols, function(col, index) {
                col.hidden !== !0 && col.dataIndex && (data += _getFieldTextAndEscape(col.text) + ",")
            }), data += "\n"
        }

        function _getPageRows(grid) {
            var cols = grid.columns,
                store = grid.store,
                data = "";
            return store.each(function(record) {
                var entry = record.getData();
                Ext.Array.each(cols, function(col, index) {
                    if (col.hidden !== !0 && col.dataIndex) {
                        var fieldName = col.dataIndex,
                            text = entry[fieldName];
                        data += _getFieldTextAndEscape(text) + ","
                    }
                }), data += "\n"
            }), data
        }

        function _getAllRows(records) {
            var data = "";
            return records.forEach(function(record) {
                fields.forEach(function(field) {
                    var text = record[field];
                    data += _getFieldTextAndEscape(text) + ","
                }), data += "\n"
            }), data
        }

        function _getFieldTextAndEscape(fieldData) {
            var string = _getFieldText(fieldData),
                escapedText = _escapeForCSV(string);
            return _sanitise(escapedText)
        }

        function _getFieldText(fieldData) {
            var text;
            return text = null === fieldData || void 0 === fieldData ? "" : fieldData._refObjectName && !fieldData.getMonth ? fieldData._refObjectName : fieldData instanceof Date ? Ext.Date.format(fieldData, this.dateFormat) : "number" == typeof fieldData ? "" + fieldData : fieldData.match ? fieldData : ""
        }

        function _escapeForCSV(string) {
            return string.match(/,/) && (string = string.match(/"/) ? string.replace(/,/g, "") : '"' + string + '"'), string
        }

        function _sanitise(text) {
            var sanitisedText = text.replace(/<\/?[^>]+(>|$)/g, " ");
            return sanitisedText = sanitisedText.replace(/&(lt|gt|nbsp);/g, function(strMatch, p1) {
                return "nbsp" == p1 ? " " : "lt" == p1 ? "<" : ">"
            })
        }
        var rallyGrid, fields = ["Name", "FormattedID", "Description", "c_AcceptanceTests", "c_AcceptanceCriteria", "c_PERT"];
        Ext.create("Rally.data.WsapiDataStore", {
            model: "UserStory",
            fetch: fields,
            autoLoad: !0,
            limit: 1 / 0,
            listeners: {
                load: _onDataStoreLoaded,
                scope: this
            }
        })
    }
});
Rally.launchApp('LabRallyGrid', {
    name: "rallypoc",
    parentRepos: ""
});