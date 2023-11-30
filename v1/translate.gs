function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem("Start", "showSidebar")
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  const ui =
    HtmlService.createHtmlOutputFromFile("sidebar").setTitle("Belongg AI");
  DocumentApp.getUi().showSidebar(ui);
}

function getSelectedText() {
  const selection = DocumentApp.getActiveDocument().getSelection();
  const text = [];
  if (selection) {
    const elements = selection.getSelectedElements();
    for (let i = 0; i < elements.length; ++i) {
      if (elements[i].isPartial()) {
        const element = elements[i].getElement().asText();
        const startIndex = elements[i].getStartOffset();
        const endIndex = elements[i].getEndOffsetInclusive();

        text.push(element.getText().substring(startIndex, endIndex + 1));
      } else {
        const element = elements[i].getElement();
        if (element.editAsText) {
          const elementText = element.asText().getText();
          if (elementText) {
            text.push(elementText);
          }
        }
      }
    }
  }
  return text;
}

function getTextAndTranslation() {
  const text = getSelectedText().join("\n");
  Logger.log(text);
  // return {
  //   text: text,
  // };
}

function insertText(newText) {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    let replaced = false;
    const elements = selection.getSelectedElements();
    if (
      elements.length === 1 &&
      elements[0].getElement().getType() ===
        DocumentApp.ElementType.INLINE_IMAGE
    ) {
      throw new Error("Can't insert text into an image.");
    }
    for (let i = 0; i < elements.length; ++i) {
      if (elements[i].isPartial()) {
        const element = elements[i].getElement().asText();
        const startIndex = elements[i].getStartOffset();
        const endIndex = elements[i].getEndOffsetInclusive();
        element.deleteText(startIndex, endIndex);
        if (!replaced) {
          element.insertText(startIndex, newText);
          replaced = true;
        } else {
          const parent = element.getParent();
          const remainingText = element.getText().substring(endIndex + 1);
          parent.getPreviousSibling().asText().appendText(remainingText);
          if (parent.getNextSibling()) {
            parent.removeFromParent();
          } else {
            element.removeFromParent();
          }
        }
      } else {
        const element = elements[i].getElement();
        if (!replaced && element.editAsText) {
          element.clear();
          element.asText().setText(newText);
          replaced = true;
        } else {
          if (element.getNextSibling()) {
            element.removeFromParent();
          } else {
            element.clear();
          }
        }
      }
    }
  } else {
    const cursor = DocumentApp.getActiveDocument().getCursor();
    const surroundingText = cursor.getSurroundingText().getText();
    const surroundingTextOffset = cursor.getSurroundingTextOffset();
    if (surroundingTextOffset > 0) {
      if (surroundingText.charAt(surroundingTextOffset - 1) !== " ") {
        newText = " " + newText;
      }
    }
    if (surroundingTextOffset < surroundingText.length) {
      if (surroundingText.charAt(surroundingTextOffset) !== " ") {
        newText += " ";
      }
    }
    cursor.insertText(newText);
  }
}

function userAuth() {
  const ui =
    HtmlService.createHtmlOutputFromFile("index").setTitle("Belongg AI");
  DocumentApp.getUi().showSidebar(ui);
}
