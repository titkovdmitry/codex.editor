/**
 * Codex Editor toolbox
 *
 * All tools be able to appended here
 *
 * @author Codex Team
 * @version 1.0
 */

module.exports = (function (toolbox) {

    let editor = codex.editor;

    toolbox.opened = false;
    toolbox.openedOnBlock = null;

    /** Shows toolbox */
    toolbox.open = function () {

        /** Close setting if toolbox is opened */
        if (editor.toolbar.settings.opened) {

            editor.toolbar.settings.close();

        }

        /** Add 'toolbar-opened' class for current block **/
        toolbox.openedOnBlock = editor.content.currentNode;
        toolbox.openedOnBlock.classList.add('toolbar-opened');

        /** display toolbox */
        editor.nodes.toolbox.classList.add('opened');

        /** Animate plus button */
        editor.nodes.plusButton.classList.add('clicked');

        /** toolbox state */
        editor.toolbar.toolbox.opened = true;

    };

    /** Closes toolbox */
    toolbox.close = function () {

        /** Remove 'toolbar-opened' class from current block **/
        if (toolbox.openedOnBlock) toolbox.openedOnBlock.classList.remove('toolbar-opened');
        toolbox.openedOnBlock = null;

        /** Makes toolbox disappear */
        editor.nodes.toolbox.classList.remove('opened');

        /** Rotate plus button */
        editor.nodes.plusButton.classList.remove('clicked');

        /** toolbox state */
        editor.toolbar.toolbox.opened = false;

        editor.toolbar.current = null;

    };

    toolbox.leaf = function () {

        let currentTool = editor.toolbar.current,
            tools       = Object.keys(editor.tools),
            barButtons  = editor.nodes.toolbarButtons,
            nextToolIndex = 0,
            toolToSelect,
            visibleTool,
            tool;

        if ( !currentTool ) {

            /** Get first tool from object*/
            for(tool in editor.tools) {

                if (editor.tools[tool].displayInToolbox) {

                    break;

                }

                nextToolIndex ++;

            }

        } else {

            nextToolIndex = (tools.indexOf(currentTool) + 1) % tools.length;
            visibleTool = tools[nextToolIndex];

            while (!editor.tools[visibleTool].displayInToolbox) {

                nextToolIndex = (nextToolIndex + 1) % tools.length;
                visibleTool = tools[nextToolIndex];

            }

        }

        toolToSelect = tools[nextToolIndex];

        for ( var button in barButtons ) {

            barButtons[button].classList.remove('selected');

        }

        barButtons[toolToSelect].classList.add('selected');
        editor.toolbar.current = toolToSelect;

    };

    /**
     * Transforming selected node type into selected toolbar element type
     * @param {event} event
     */
    toolbox.toolClicked = function (event) {

        /**
         * UNREPLACEBLE_TOOLS this types of tools are forbidden to replace even they are empty
         */
        var UNREPLACEBLE_TOOLS = ['image', 'link', 'list', 'instagram', 'twitter', 'embed'],
            tool               = editor.tools[editor.toolbar.current],
            workingNode        = editor.content.currentNode,
            currentInputIndex  = editor.caret.inputIndex,
            newBlockContent,
            appendCallback,
            blockData;

        /** Make block from plugin */
        newBlockContent = tool.render();

        /** information about block */
        blockData = {
            block     : newBlockContent,
            type      : tool.type,
            stretched : false
        };

        if (
            workingNode &&
            UNREPLACEBLE_TOOLS.indexOf(workingNode.dataset.tool) === -1 &&
            workingNode.textContent.trim() === ''
        ) {

            /** Replace current block */
            editor.content.switchBlock(workingNode, newBlockContent, tool.type);

        } else {

            /** Insert new Block from plugin */
            editor.content.insertBlock(blockData);

            /** increase input index */
            currentInputIndex++;

        }

        /** Fire tool append callback  */
        appendCallback = tool.appendCallback;

        if (appendCallback && typeof appendCallback == 'function') {

            appendCallback.call(event);

        }

        window.setTimeout(function () {

            /** Set caret to current block */
            editor.caret.setToBlock(currentInputIndex);

        }, 10);


        /**
         * Changing current Node
         */
        editor.content.workingNodeChanged();

        /**
         * Move toolbar when node is changed
         */
        editor.toolbar.move();

    };

    return toolbox;

})({});