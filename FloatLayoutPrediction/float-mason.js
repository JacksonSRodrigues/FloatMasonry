document.addEventListener("DOMContentLoaded", function(event){

    var self = this;
    // Stores the refrence columns for the elements to match and find the column index.
    var columnRefences = [];

    // Stores the height/filled in each column.
    var renderedColumnHeights = [];

    // column height of the right most item in the column, 
    // which becomes the refence to find the next/future column to place the element.
    var refrenceLine = 0;

    // retunrs the total number of Available column at a time.
    var columnCount = 3;

    var getStyle = function(name) {
        var style = document.createElement('style');
        style.id = name;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(""));
        //injectStyle(style);
        return style;
    };

    var injectStyle = function(style) {
        document.head.appendChild(style);
    }

    var removeStyle = function(name) {

    }

    function addCSSRule(sheet, selector, rules, index) {
       /* if ("insertRule" in sheet) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        }
        else if ("addRule" in sheet) {
            sheet.addRule(selector, rules, index);
        }
        */
        sheet.styles += selector + '{' + rules + '}';
        sheet.styles += "\n";
    }

    // Returns the projected column of the element.
    var projectedColumnIndex = function(element) {

        var index = -1;
        var elementRect = element.getBoundingClientRect();

        for (var i = 0; i < columnRefences.length; i++) {
            var referenceRect = columnRefences[i];

             //  sl------sr                 sl-------sr
            //             el-----------er
            // Instead of checking if elements overlaps,
            // we will make sure it doesnt overlap which has only two possiblities as above
            if ( !((referenceRect.right < elementRect.left) || (elementRect.right < referenceRect.left)) ) {
                // if overlap, then this is the element. so set column.
                index = i;
                break;
            }
        }

        if (index < 0) {
            columnRefences.push(elementRect);
            index = columnRefences.length - 1;
        }

        return index;
    }

    var updateRefernceLine = function(column, value) {
        if (column == (columnCount-1) && refrenceLine < value) {
            refrenceLine = value;
        }
    }

    var getRefrenceLine = function() {
        return refrenceLine;
    }

    var canFillToRight = function(index, callback) {
        var refLine = getRefrenceLine();
        var currentIndexHeight = getFilledColumnHeight(index);
        var nextIndexHeight = getFilledColumnHeight(index+1);
        if ( (index < (columnCount-1)) && ( (nextIndexHeight == undefined) || ( ( currentIndexHeight > refLine ) && (currentIndexHeight>nextIndexHeight) && ( nextIndexHeight <= refLine ) ) ) ) {
            return true;
        }
        return false;
    };

    var canFillToLeft = function(index,callback) {
        if ( (index > 0) && ( getRefrenceLine() >= getFilledColumnHeight(index-1) ) ) {
            return true;
        }
        return false;
    };

    var predictColumnForElement = function(element, lastRenderedColumn) {

        if (lastRenderedColumn == undefined) {
            return 0;
        }

        if(canFillToRight(lastRenderedColumn)) {
            return lastRenderedColumn + 1;
        }
        else {
            var nextColumn = lastRenderedColumn;
            while (canFillToLeft(nextColumn)) {
                nextColumn = nextColumn - 1;
            }

            if (nextColumn<lastRenderedColumn) {
                return nextColumn;
            }
            else {
                return lastRenderedColumn;
            }
        }
    }


    var getFilledColumnHeight = function(index) {
        if (index < renderedColumnHeights.length) {
            return renderedColumnHeights[index];
        }
        return undefined;
    };

    var setFilledColumHeight = function(index, value) {
        renderedColumnHeights[index] = value;
    };

    var appendMasonStyleForElement = function (element, index, lastRenderedColumn ,stylesheet) {
        var columnIndex = predictColumnForElement(element, lastRenderedColumn);
        var filledHeight = getFilledColumnHeight(columnIndex);
        

        var elementRect = element.getBoundingClientRect();
        var nextFilledHeight = elementRect.height;
        var refLine = getRefrenceLine();

        if (filledHeight != undefined) { // if undefined then its the first column.
            var predictedPosition = filledHeight;

            if(predictedPosition < refLine) {
                predictedPosition = refLine;
            }

            var elementStyle = window.getComputedStyle(element);
            var verticalDelta = (filledHeight - predictedPosition);
            var marginTopParsed = elementStyle['margin-top'] || elementStyle['marginTop'];
            var marginTop = parseFloat(marginTopParsed);

            if (verticalDelta != 0) {

                var masonElementSelector = '.float-masonry .mason-element:nth-child(' + index + ')';
                var rules = 'margin-top:' + verticalDelta + 'px;'
                addCSSRule(stylesheet, masonElementSelector, rules);
            }

            nextFilledHeight = filledHeight + elementRect.height + marginTop;
        }

        setFilledColumHeight(columnIndex, nextFilledHeight);
        updateRefernceLine(columnIndex, nextFilledHeight);

        return columnIndex;
    };


    var generateMasonStyle = function(container) {
        var styleSheet = {styles:''};
        var sheetName = "float_mason_style_sheet";
        var style = getStyle(sheetName);
        var masonElements = container.children;
        var lastRenderdColumn = undefined;
         for (var i = 0; i < masonElements.length; i++ ) {
             lastRenderdColumn = appendMasonStyleForElement(masonElements[i], (i+1), lastRenderdColumn, styleSheet);
         }
        style.innerHTML = styleSheet.styles;
        injectStyle(style);
    }

    
    var template = `<div class="mason-element">    
                        <div class="card">
                            <div class="media-container">
                                <img class="banner" src="">
                            </div>
                            <div class="text-container">
                                <h1 class="title"></h1>
                                <hr class="title-line">
                                <p class="description"></p>
                            </div>
                        </div>
                    </div>`;
   var dataColumns = jsonData.data;

   var partialHTMLForItem = function(item, index) {
       
       var templateDiv = document.createElement('div');
       templateDiv.innerHTML = template;

       var mediaContainer = templateDiv.getElementsByClassName('media-container')[0];
       var imageBanner = templateDiv.getElementsByClassName('banner')[0];

       var title = templateDiv.getElementsByClassName('title')[0];
       var description = templateDiv.getElementsByClassName('description')[0];

       if (item.media != undefined && item.media.url != undefined) {
           imageBanner.src = item.media.url;
       }
       else {
           mediaContainer.classList += " hidden";
       }

       title.innerHTML = item.title;
       description.innerHTML = item.description;

       return templateDiv.innerHTML;
   }

   var loadContents = function(container) {
       var partials = "";
       for (var i = 0 ; i < 100 ; i++) {
           var item = dataColumns[i%12];
           partials += partialHTMLForItem(item,i);
       }

       container.innerHTML = partials;
   }


   var masonContainer = document.getElementsByClassName('float-masonry')[0];
   loadContents(masonContainer);

   var timer = setTimeout(function(){
       generateMasonStyle(masonContainer);
   },10000);



});