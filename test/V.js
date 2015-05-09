 (function(undefined){
    var opts = 
    {
        urls : 
        {
            exportUrl : '/CreditWeb/Common/ExportGridData',
            getQuickSearchFilterData : "/CreditWeb/VantageSearch/GetQuickSearchFilterData",
            vantageSearchUrl : "/CreditWeb/VantageSearch/RetrieveDataFromVantageSearch",
            getUnfilledInquiryDataUrl : "/CreditWeb/VantageSearch/GetUnfilledInquiryData",
            getInventoryData : "/CreditWeb/VantageSearch/GetInventoryData",
            getBondTradesData : "/CreditWeb/VantageSearch/GetBondTradesData",
            getLoanTradesData : "/CreditWeb/VantageSearch/GetLoanTradesData",
            getCDSTradesData : "/CreditWeb/VantageSearch/GetCDSTradesData",
            getTRACEData : "/CreditWeb/VantageSearch/GetTRACEData",
            getRFQData : "/CreditWeb/VantageSearch/GetRFQData",
            getInquiryData : "/CreditWeb/VantageSearch/GetInquiryData",
            getAxesData : "/CreditWeb/VantageSearch/GetAxesData",
            getClientPortfolioData : "/CreditWeb/VantageSearch/GetClientPortfolioData",
            getNewIssuesData : "/CreditWeb/VantageSearch/GetNewIssuesData",
            getClientData : "/CreditWeb/VantageSearch/GetClientData",
            getSalesPersonData : "/CreditWeb/VantageSearch/GetSalesPersonData",
            getTradersData : "/CreditWeb/VantageSearch/GetTradersData",
            getAllSectorsData : "/CreditWeb/VantageSearch/GetAllSectorsData",
            getQuerySearchData : "/CreditWeb/VantageSearch/AcidForSearchQuery"
        },
        data : 
        {
            vantageSearchUrl : function(){
                var item = ["UnfilledInquiry", "Inventory", "BondTrades", "LoanTrades", "CDSTrades", "TRACE", "RFQ", "Axes", "Inquiry"];
                var result = 
                {
                    "clientTier" : 1
                };
                $.each(item, function(){
                    result[this] = 
                    {
                        "totalNumberOfHits|99-2000" : 100,
                        "size|1-100" : 0
                    };
                });
                return Mock.mock(result);
            },
            getInventoryData : 
            {
                "Rows|1-400" : [{
                    "ASKCAPSIZE|10-1000000" : 915000,
                    "ASKPRICE|10-1000000" : 113.375,
                    "ASKSPREAD|10-1000000" : 0,
                    "BIDCAPSIZE|10-1000000 " : 0,
                    "BIDPRICE|10-1000000" : 0,
                    "BIDSPREAD|10-1000000 " : 0,
                    "COUPONRATE" : null,
                    "CURRENCY" : '@STRING',
                    "CUSIP" : "@STRING(9)",
                    "DESCRIPTION" : "CIT 6.625 01-APR-18",
                    "FIRMACCOUNT" : "",
                    "ISIN" : "@STRING(12)",
                    "ISSUERNAME" : "",
                    "LASTUPDATE" : null,
                    "MATURITYDATE" : null,
                    "RATINGSMOODYS" : "Ba3",
                    "RATINGSSP" : "BB-",
                    "SECTORDESC" : "Financial",
                    "SECTORID" : "",
                    "TRADERNAME" : ""
                }]
            }
        }
    };
    
    var result = (function(){
        $.each(opts.data, function(i, val){
            Mock.mock(opts.urls[i], val);
            console.log("Mock URL: " + opts.urls[i]);
        });
        console.log("Mock complete!");
    })();
})();