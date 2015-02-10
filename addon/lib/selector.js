import Ember from 'ember';

/**
 * @class Selector
 * @extends Ember.Object
 */
export default Ember.Object.extend({
  /**
   * The anchor node for the selection
   * @property $anchor
   */
  $anchor: function get$anchor() {
    return Ember.$(this.get('selection.anchorNode'));
  }.property('selectionState'),

  /**
   * The focus node for the selection
   * @property $focus
   */
  $focus: function get$focus() {
    return Ember.$(this.get('selection.focusNode'));
  }.property('selectionState'),

  /**
   * The `Document` whose selection this object interacts with
   * @property {Document} document
   */
  document: function getDocument() {
    return window.document;
  }.property(),

  /**
   * The current `Range` for the selection
   * @property {Range} range
   */
  range: function getRange() {
    if (this.get('selection.rangeCount') < 1) {
      return null;
    } else {
      return this.get('selection').getRangeAt(0);
    }
  }.property('selectionState'),

  /**
   * The `Selection` object provided by the browser environment
   * @property {Selection} selection
   */
  selection: function getSelection() {
    return this.get('document').getSelection();
  }.property('document'),

  /**
   * An array of arrays of selected nodes and their related offsets
   *
   * If the selection is collapsed, only the anchor node and anchor offset will
   * be provided. Otherwise, the anchor information will be followed by the
   * focus information.
   *
   * @property {Array<Array<Selection, Number>>} selections
   */
  selections: function getSelections() {
    var selection  = this.get('selection');
    var pointTypes = selection.isCollapsed ? 'anchor'.w() : 'anchor focus'.w();
    var selections = [];

    for (var i = 0, len = pointTypes.length; i < len; i++) {
      var pointType = pointTypes[i];
      var $node     = Ember.$(selection[pointType + 'Node']);
      var offset    = selection[pointType + 'Offset'];
      selections.push([$node, offset]);
    }

    return selections;
  }.property('selectionState'),

  /**
   * Bind to the `selectionchange` event.
   * @method bindChange
   */
  bindChange: function bindChange() {
    this.teardown();
    this.get('document')
      .addEventListener('selectionchange', this.get('onChangeFn'));
  }.on('init').observes('document'),

  /**
   * Bust the `selectionState` property.
   * @method onChange
   */
  onChangeFn: function getOnChangeFn() {
    return function onChange() {
      this.notifyPropertyChange('selectionState');
    }.bind(this);
  }.property(),

  /**
   * Select a range by providing the given start node and offset and end node
   * and offset.
   * @method select
   */
  select: function select($startNode, startOffset, $endNode, endOffset) {
    var range     = this.get('document').createRange();
    var selection = this.get('selection');
    range.setStart($startNode.get(0), startOffset);

    if ($endNode && endOffset) {
      range.setEnd($endNode.get(0), endOffset);
    } else {
      range.setEnd($startNode.get(0), startOffset);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  },

  /**
   * Remove event listeners on the `document`.
   * @method teardown
   */
  teardown: function teardown() {
    this.get('document')
      .removeEventListener('selectionchange', this.get('onChangeFn'));
  },
});
