// // Copyright (c) 2012 The Chromium Authors. All rights reserved.
// // Use of this source code is governed by a BSD-style license that can be
// // found in the LICENSE file.

// // Send back to the popup a sorted deduped list of valid link URLs on this page.
// // The popup injects this script into all frames in the active tab.

// var links = [].slice.apply(document.getElementsByTagName('a'));
// links = links.map(function(element) {
//   // Return an anchor's href attribute, stripping any URL fragment (hash '#').
//   // If the html specifies a relative path, chrome converts it to an absolute
//   // URL.
//   var href = element.href;
//   var hashIndex = href.indexOf('#');
//   if (hashIndex >= 0) {
//     href = href.substr(0, hashIndex);
//   }
//   return href;
// });

// links.sort();

// // Remove duplicates and invalid URLs.
// var kBadPrefix = 'javascript';
// for (var i = 0; i < links.length;) {
//   if (((i > 0) && (links[i] == links[i - 1])) ||
//       (links[i] == '') ||
//       (kBadPrefix == links[i].toLowerCase().substr(0, kBadPrefix.length))) {
//     links.splice(i, 1);
//   } else {
//     ++i;
//   }
// }
// console.log(links);
// if (!$) {
//   document.write("<script language=javascript src='//cdn.bootcss.com/jquery/3.4.1/jquery.min.js'></script>");
// }

var domStatus = 0;
links = [];
if (window.location.host.indexOf("dataeye.com") < 0) {
    chrome.extension.sendRequest(null);
} else {
    $(function() {
        setTimeout(() => {
            if (domStatus == 0) {
                keepData();
            }
        }, 1000);
    });
}

// 保存需要的数据
function keepData() {
    if ($(".ant-calendar-range-picker-input").length > 0) {
        domStatus == 1;
        var GstartDate = $(".ant-calendar-range-picker-input")
                .eq(0)
                .attr("value"),
            GendDate = $(".ant-calendar-range-picker-input")
                .eq(1)
                .attr("value"),
            GpageNum = $(".ant-pagination-item-active a").text();
        var valueList = {};
        valueList.materialType = [
            {
                v: "图片",
                k: "1"
            },
            {
                v: "GIF",
                k: "3"
            },
            {
                v: "视频",
                k: "2"
            }
        ];
        valueList.sortBy = [
            {
                v: "最近出现",
                k: "FIRST_SEEN"
            },
            {
                v: "出现次数",
                k: "NUM"
            },
            {
                v: "最多计划使用",
                k: "CREATIVE_NUM"
            },
            {
                v: "最多产品使用",
                k: "PRODUCT_NUM"
            },
            {
                v: "素材使用天数",
                k: "DAYS"
            }
        ];
        valueList.mobileType = [
            {
                v: "iOS",
                k: 1
            },
            {
                v: "Android",
                k: 2
            }
        ];
        var yixuanze = $(".de-QueryMultiple-resultInner .de-DisplaySelect-value .de-QueryMultiple-tag");

        var keytoString = {
            materialType: "素材类型",
            mediaIds: "媒体",
            positionIds: "广告位",
            mobileType: "平台",
            sortBy: "排序方式",
            labelIds: "游戏风格"
        };
        function getkey(str) {
            for (var i in keytoString) {
                if (str == keytoString[i]) {
                    return i;
                }
            }
            return null;
        }
        function getValue(key, str) {
            if (!!valueList[key]) {
                return getValueFromObj(valueList[key], str);
            }
        }
        function getValueFromObj(obj, str) {
            for (var i in obj) {
                if (obj[i]["v"] == str) {
                    return obj[i]["k"];
                }
                if (!!obj[i].children && obj[i].children.length > 0) {
                    var fromchil = getValueFromObj(obj[i].children, str);
                    if (!!fromchil) {
                        return fromchil;
                    }
                }
            }
            return null;
        }

        $.get("//adx.dataeye.com/common/getMediaMenu", function(res) {
            if (!!res && !!res.content) {
                valueList["mediaIds"] = res.content;
                $.get("//adx.dataeye.com/common/getLabelMenu", function(res) {
                    if (!!res && !!res.content) {
                        valueList["labelIds"] = res.content;
                        var datas = {};
                        var curkey;
                        var curvalue;
                        yixuanze.each(function(key, item) {
                            var text = $(item).text();

                            if (!!text) {
                                var textarr = text.split("：");
                                if (textarr.length > 1) {
                                    curkey = getkey(textarr[0]);
                                    curvalue = getValue(curkey, textarr[1]);
                                    if (!!curkey && !!curvalue) {
                                        if (!datas[curkey]) {
                                            datas[curkey] = curvalue;
                                        } else {
                                            datas[curkey] += "," + curvalue;
                                        }
                                    }
                                }
                            }
                        });
                        // var materialType = $(".de-DisplaySelect-itemSelected");
                        // var mobileType = ;
                        // var labelIds = ;
                        var datas2 = { pageId: GpageNum, pageSize: "48", startDate: GstartDate, endDate: GendDate };
                        var data = Object.assign(datas, datas2);
                        $.get(
                            "//adx.dataeye.com/search/searchMaterial",
                            data,
                            function(res) {
                                if (!res || !res.content) {
                                    chrome.extension.sendRequest(null);
                                }
                                for (let x = 0; x < res.content.length; x++) {
                                    if (!!res.content[x].videoList) {
                                        var title = res.content[x].info[0]["adTitle"];

                                        for (var y in res.content[x].videoList) {
                                            if (y > 0) {
                                                title = title + y;
                                            }
                                            links.push({ url: res.content[x].videoList[y], title: title });
                                        }
                                    }

                                    // if (res.content[x].videoList != "") {

                                    //     links.push(res.content[x].videoList[0]);
                                    // }
                                }
                                // console.log(links);
                                chrome.extension.sendRequest(links);
                            },
                            "json"
                        );
                    } else {
                        chrome.extension.sendRequest(null);
                    }
                });
            } else {
                chrome.extension.sendRequest(null);
            }
        });
    }
}
