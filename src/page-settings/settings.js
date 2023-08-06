document.addEventListener('DOMContentLoaded', async function () {

  // ---------------------------------------------------------
  // ------------------- Initialization ----------------------
  // ---------------------------------------------------------

  // Initialize settings with default values, if any are missing
  await initializeSettingsWithDefaults();

  // ---------------------------------------------------------
  // ------------------- Setup Display -----------------------
  // ---------------------------------------------------------

  // Get DOM elements
  const saveButton = document.getElementById('save-btn');
  const resetButton = document.getElementById('reset-btn');
  const validationMessage = document.querySelector('.validation-message');

  const instanceField = document.getElementById('instance-field');
  const lemmyRadio = document.getElementById('radio-lemmy');
  const kbinRadio = document.getElementById('radio-kbin');
  const showSidebarCheckbox = document.getElementById('showSidebarButtons');
  const showCommunityNotFoundCheckbox = document.getElementById('showCommunityNotFound');
  const searchOpenLemmyverseCheckbox = document.getElementById('searchOpenLemmyverse');
  const instanceListTextArea = document.getElementById('instance-list');

  // Function to set field values based on settings
  async function setFieldValues() {
    try {
      const allSettings = (await getAllSettings()).settings; // Get all settings

      instanceField.value = allSettings.selectedInstance || '';
      lemmyRadio.checked = allSettings.selectedType === 'lemmy';
      kbinRadio.checked = allSettings.selectedType === 'kbin';
      showSidebarCheckbox.checked = allSettings.runOnCommunitySidebar;
      showCommunityNotFoundCheckbox.checked = allSettings.runOnCommunityNotFound;
      searchOpenLemmyverseCheckbox.checked = allSettings.toolSearchCommunity_openInLemmyverse;
      instanceListTextArea.value = allSettings.instanceList.map(item => `${item.name}, ${item.url}`).join('\n');
    } catch (error) {
      console.error('Error retrieving settings:', error);
    }
  }

  setFieldValues();

  // ---------------------------------------------------------
  // ------------------- Validation --------------------------
  // ---------------------------------------------------------

  // Function to show validation error message
  const showValidationError = (message) => {
    validationMessage.textContent = message;
    validationMessage.style.display = 'block';
    instanceField.classList.add('validation-error');
  };

  // Function to hide validation error message
  const hideValidationError = () => {
    validationMessage.style.display = 'none';
    instanceField.classList.remove('validation-error');
  };

  hideValidationError();

  // ---------------------------------------------------------
  // ------------------- Basic Functions ---------------------
  // ---------------------------------------------------------

  // Event handler for input event on selectedInstance text field
  instanceField.addEventListener('input', function () {
    if (saveClicked) {
      const instanceValue = this.value.trim();
      if (!validInstanceURLPattern.test(instanceValue)) {
        showValidationError("Please enter a valid URL:   (ex. 'https://lemmy.ca')");
      } else {
        hideValidationError();
      }
    }
  });

  function showSaveConfirmation(text) {
    const toastMessage = document.getElementById('toast-message');
    toastMessage.innerText = text;
    toastMessage.classList.add('show');
  
    setTimeout(() => {
      toastMessage.classList.remove('show');
    }, 3000);
  }

  // Save button click event handler
  let saveClicked = false;
  saveButton.addEventListener('click', async function () {
    saveClicked = true;
    const instanceValue = instanceField.value.trim();
    const platformValue = lemmyRadio.checked ? "lemmy" : "kbin";
    const toggleShowSidebarButtons = showSidebarCheckbox.checked;
    const toggleShowCommunityNotFound = showCommunityNotFoundCheckbox.checked;
    const toggleSearchOpenLemmyverse = searchOpenLemmyverseCheckbox.checked;

    // Validation check
    if (!validInstanceURLPattern.test(instanceValue)) {
      showValidationError("Please enter a valid URL:   (ex. 'https://lemmy.ca')");
      showSaveConfirmation("Settings could not be saved, see errors for details.");
      return;
    } else {
      hideValidationError();
    }

    const websiteListTextArea = document.getElementById('instance-list');
    const websiteListText = websiteListTextArea.value.trim();
    const websitesArray = websiteListText.split('\n').map(line => {
      const [name, url] = line.split(',').map(item => item.trim());
      return { name, url };
    });

    // Store values to local storage
    await setSetting('selectedInstance', instanceValue);
    await setSetting('selectedType', platformValue);
    await setSetting('runOnCommunitySidebar', toggleShowSidebarButtons);
    await setSetting('runOnCommunityNotFound', toggleShowCommunityNotFound);
    await setSetting('toolSearchCommunity_openInLemmyverse', toggleSearchOpenLemmyverse);
    await setSetting('instanceList', websitesArray);

    showSaveConfirmation("Settings saved successfully!");
    
    console.log(await getAllSettings());

  });

  // Reset button click event handler
  resetButton.addEventListener('click', async function () {
    const confirmation = confirm("Are you sure you want to reset all settings?");

    if (confirmation) {
      await resetAllSettingsToDefault();
      console.log("Settings reset to default.");

      // Reset values to default
      const defaultSettings = await getAllSettings();

      instanceField.value = defaultSettings.selectedInstance ? defaultSettings.selectedInstance : '';
      lemmyRadio.checked = defaultSettings.selectedType === 'lemmy' ? true : false;
      kbinRadio.checked = defaultSettings.selectedType === 'kbin' ? true : false;
      showSidebarCheckbox.checked = defaultSettings.runOnCommunitySidebar ? true : false;
      showCommunityNotFoundCheckbox.checked = defaultSettings.runOnCommunityNotFound ? true : false;
      searchOpenLemmyverseCheckbox.checked = defaultSettings.toolSearchCommunity_openInLemmyverse ? true : false;

      hideValidationError();
      showSaveConfirmation("Settings reset to default.");

    } else { console.log("Settings reset cancelled."); }
  });
});
