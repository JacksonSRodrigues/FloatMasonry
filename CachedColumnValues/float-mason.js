document.addEventListener("DOMContentLoaded", function(event){

    // Stores the refrence columns for the elements to match and find the column index.
    var columnRefences = [];

    // Stores the height/filled in each column.
    var renderedColumnHeights = [];

    // column height of the right most item in the column, 
    // which becomes the refence to find the next/future column to place the element.
    var refrenceLine = 0;

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


    var getFilledColumnHeight = function(index) {
        if (index < renderedColumnHeights.length) {
            return renderedColumnHeights[index];
        }
        return 0;
    };

    var setFilledColumHeight = function(index, value) {
        renderedColumnHeights[index] = value;
    };

    var appendMasonStyleForElement = function(element, index, stylesheet) {

        var columnIndex = projectedColumnIndex(element);
        var filledHeight = getFilledColumnHeight(columnIndex);

        var elementRect = element.getBoundingClientRect();
            
            var elementStyle = window.getComputedStyle(element);
            var verticalDelta = (filledHeight - elementRect.top);
            var marginTopParsed = elementStyle['margin-top'] || elementStyle['marginTop'];
            var marginTop = parseFloat(marginTopParsed);

            var masonElementSelector = '.float-masonry .mason-element:nth-child('+index+')';
            var rules = 'margin-top:'+(verticalDelta + 3*marginTop)+'px;'
            addCSSRule(stylesheet,masonElementSelector,rules);
            setFilledColumHeight(columnIndex, elementRect.bottom+(verticalDelta+ 2*marginTop));

    };


    var generateMasonStyle = function(container) {
        var sheetName = "float_mason_style_sheet";
        var style = getStyle(sheetName);
        var masonElements = container.children;
         for (var i = 0; i < masonElements.length; i++ ) {
             appendMasonStyleForElement(masonElements[i], (i+1), style.sheet);
         }
        injectStyle(style);
    }

    var masonContainer = document.getElementsByClassName('float-masonry')[0];
    generateMasonStyle(masonContainer);



});