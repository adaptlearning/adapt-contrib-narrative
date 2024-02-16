import ItemsComponentModel from 'core/js/models/itemsComponentModel';

export default class NarrativeModel extends ItemsComponentModel {
  restoreUserAnswers() {
    const numberArray = this.get('_userAnswer');
    if (!numberArray) return;
    const children = this.getChildren();
    const shouldRestoreActiveItem = (numberArray.length > children.length);
    if (shouldRestoreActiveItem) {
      const activeItemIndex = numberArray.pop();
      this.setActiveItem(activeItemIndex);
    }
    children.forEach(child => child.set('_isVisited', Boolean(numberArray[child.get('_index')])));
  }

  storeUserAnswer() {
    const items = this.getChildren().slice(0);
    items.sort((a, b) => a.get('_index') - b.get('_index'));
    const numberArray = items.map(child => child.get('_isVisited') ? 1 : 0);
    const activeItem = this.getActiveItem();
    if (activeItem) numberArray.push(activeItem.get('_index'));
    this.set('_userAnswer', numberArray);
  }
}
