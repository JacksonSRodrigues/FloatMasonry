document.addEventListener("DOMContentLoaded", function(event){

    // Stores the refrence columns for the elements to match and find the column index.
    var columnRefences = [];

    // Stores the height/filled in each column.
    var renderedColumnHeights = [0,0,0,0];

    // column height of the right most item in the column, 
    // which becomes the refence to find the next/future column to place the element.
    var refrenceLine = 0;

    // retunrs the total number of Available column at a time.
    var columnCount = 1;

    var getStyle = function(name) {
        var style = document.createElement('style');
        style.id = name;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(""));
        injectStyle(style);
        return style;
    };

    var injectStyle = function(style) {
        document.head.appendChild(style);
    }

    var removeStyle = function(name) {

    }

    function addCSSRule(sheet, selector, rules, index) {
        if ("insertRule" in sheet) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        }
        else if ("addRule" in sheet) {
            sheet.addRule(selector, rules, index);
        }
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
        if (column == (columnCount-1)) {
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
        if ( (index < (columnCount-1)) && ( currentIndexHeight > refLine ) && ( refLine >= nextIndexHeight ) ) {
            console.log("Can fill right");
            console.log("--> Current Line "+getRefrenceLine()+" >= "+getFilledColumnHeight(index+1) );
            return true;
        }
        console.log("Can't fill right");
        console.log("--> Current Line "+getRefrenceLine()+" >= "+getFilledColumnHeight(index+1) );
        return false;
    };

    var canFillToLeft = function(index,callback) {
        if ( (index > 0) && ( getRefrenceLine() >= getFilledColumnHeight(index-1) ) ) {
            console.log("Can fill left");
            console.log("--> Current Line "+getRefrenceLine()+" >= "+getFilledColumnHeight(index-1) );
            return true;
        }
        console.log("Can't' fill left");
        console.log("--> Current Line "+getRefrenceLine()+" >= "+getFilledColumnHeight(index-1) );
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
        return 0;
    };

    var setFilledColumHeight = function(index, value) {
        renderedColumnHeights[index] = value;
    };

    var appendMasonStyleForElement = function (element, index, lastRenderedColumn ,stylesheet) {
        console.log("----------------------------");
        console.log("EL: "+element.innerHTML);
        var columnIndex = predictColumnForElement(element, lastRenderedColumn);
        console.log("column: "+columnIndex);
        var filledHeight = getFilledColumnHeight(columnIndex);

        var elementRect = element.getBoundingClientRect();

        var elementStyle = window.getComputedStyle(element);
        var verticalDelta = (filledHeight - elementRect.top);
        var marginTopParsed = elementStyle['margin-top'] || elementStyle['marginTop'];
        var marginTop = parseFloat(marginTopParsed);

        var masonElementSelector = '.float-masonry .mason-element:nth-child(' + index + ')';
        var rules = 'margin-top:' + (verticalDelta + 3 * marginTop) + 'px;'
        addCSSRule(stylesheet, masonElementSelector, rules);
        var filledHeight = elementRect.bottom + (verticalDelta + 2 * marginTop);
        setFilledColumHeight(columnIndex, filledHeight);
        updateRefernceLine(columnIndex, filledHeight);

        return columnIndex;
    };


    var generateMasonStyle = function(container) {
        var sheetName = "float_mason_style_sheet";
        var style = getStyle(sheetName);
        var masonElements = container.children;
        var lastRenderdColumn = undefined;
         for (var i = 0; i < masonElements.length; i++ ) {
             lastRenderdColumn = appendMasonStyleForElement(masonElements[i], (i+1), lastRenderdColumn, style.sheet);
         }
        injectStyle(style);
    }

    var masonContainer = document.getElementsByClassName('float-masonry')[0];
    generateMasonStyle(masonContainer);



});