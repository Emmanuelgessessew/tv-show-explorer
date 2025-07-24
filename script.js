
let displayAllShows = [];
function setup() {
  fetchEpisodes("https://api.tvmaze.com/shows")
    .then((allShows) => {
      if (allShows) {
        // console.log(allShows);
        displayAllShows = allShows;
        mainShowListControl(displayAllShows);
      }
    })

    .catch((error) => console.error(error));
}
function fetchEpisodes(url) {
  return fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Fetching Problem");
      }
    })
    .catch((error) => console.error(error));
}
function mainShowListControl(allShows) {
  makePageForShows(allShows);

  const selectedShow = document.getElementById("select-show");
  selectedShow.innerHTML = "";
  const showSelect = document.createElement("select");
  showSelect.id = "showList-selector";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search Shows...";
  searchInput.id = "search-bar";

  selectedShow.append(searchInput, showSelect);

  function populateDropdown(showList) {
    showSelect.innerHTML = "";
    const existingPTag = document.querySelector("#show-count");
    if (existingPTag) {
      existingPTag.remove();
    }

    const makePtag = document.createElement("p");
    makePtag.id = "show-count";
    makePtag.textContent = `Number of shows: ${showList.length}`;
    selectedShow.appendChild(makePtag);

    showList
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((show) => {
        const option = document.createElement("option");
        option.value = show.id;
        option.textContent = show.name;
        showSelect.appendChild(option);
      });
  }

  populateDropdown(allShows);

  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
    const filteredShows = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(searchValue) ||
        show.genres.some((genre) =>
          genre.toLowerCase().includes(searchValue)
        ) ||
        show.summary.toLowerCase().includes(searchValue)
    );

    populateDropdown(filteredShows);
    makePageForShows(filteredShows);
  });

  showSelect.addEventListener("change", () => {
    const selectedOption = showSelect.options[showSelect.selectedIndex];
    // console.log(selectedOption);
    const showId = selectedOption.value;
    // console.log("this is showid" + showId);
    if (!showId) {
      makePageForEpisodes(allShows);
    } else {
      const episodePath = `https://api.tvmaze.com/shows/${showId}/episodes`;

      fetchEpisodes(episodePath)
        .then((allEpisodes) => {
          initializeSearchAndDropdown(allEpisodes);
          selectedShow.style.display = "none";
        })
        .catch((error) => {
          console.error("Error fetching episodes for selected show:", error);
        });
    }
  });
}

//make page for shows
function makePageForShows(showList) {
  const mainContainer = document.querySelector("main");
  mainContainer.innerHTML = "";

  showList
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((show) => {
      const showContainer = document.createElement("div");
      showContainer.classList.add("show-container");

      const name = document.createElement("h2");
      name.textContent = show.name;
      showContainer.appendChild(name);

      const image = document.createElement("img");
      image.src = show.image?.medium || "";

      image.alt = `${show.name} image`;
      showContainer.appendChild(image);

      const summary = document.createElement("p");
      summary.innerHTML = show.summary;
      showContainer.appendChild(summary);

      const genres = document.createElement("p");
      genres.textContent = `Genres: ${show.genres.join(", ")}`;
      showContainer.appendChild(genres);

      const status = document.createElement("p");
      status.textContent = `Status: ${show.status}`;
      showContainer.appendChild(status);

      const rating = document.createElement("p");
      rating.textContent = `Rating: ${show.rating?.average || "N/A"}`;
      showContainer.appendChild(rating);

      const runtime = document.createElement("p");
      runtime.textContent = `Runtime: ${show.runtime} minutes`;
      showContainer.appendChild(runtime);

      mainContainer.appendChild(showContainer);
    });
}

function makePageForEpisodes(episodeList) {
  const mainContainer = document.querySelector("main");
  mainContainer.innerHTML = ""; // Clear previous episodes

  episodeList.forEach((episode) => {
    const episodeDiv = document.createElement("div");
    episodeDiv.classList.add("episode");

    const title = document.createElement("h2");
    const formattedSeason = String(episode.season || "0").padStart(2, "0");
    const formattedNumber = String(episode.number || "0").padStart(2, "0");
    title.textContent = `${episode.name}${
      episode.season ? `- S${formattedSeason}E${formattedNumber}` : ""
    } `;

    const img = document.createElement("img");
    img.src = episode.image?.medium;
    img.alt = `${episode.name} - S${formattedSeason}E${formattedNumber}`;

    const refButton = document.createElement("button");
    refButton.textContent = "Reference";
    refButton.addEventListener("click", () => {
      window.open(episode.url, "_blank");
    });

    const description = document.createElement("p");
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = episode.summary;
    description.textContent = tempDiv.textContent || tempDiv.innerText;

    episodeDiv.append(title, img, refButton, description);
    mainContainer.appendChild(episodeDiv);
  });
}

function initializeSearchAndDropdown(allEpisodes) {
  const rootElem = document.getElementById("root");
  //default show all
  makePageForEpisodes(allEpisodes);
  const existingControls = document.getElementById("controls");
  if (existingControls) {
    existingControls.remove();
  }

  // Create search bar
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";
  searchInput.id = "search-bar";

  //make it episode label
  const selectLabel = document.createElement("label");
  selectLabel.setAttribute("for", "episode-label");

  // Create dropdown
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-selector";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select an episode...";
  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const formattedSeason = String(episode.season).padStart(2, "0");
    const formattedNumber = String(episode.number).padStart(2, "0");
    option.value = `${episode.name}`;
    option.textContent = `S${formattedSeason}E${formattedNumber} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
  //create button
  const button = document.createElement("button");
  button.textContent = "Display Show List";
  button.addEventListener("click", () => {
    const existingControls = document.getElementById("controls");
    if (existingControls) {
      existingControls.remove();
    }
    mainShowListControl(displayAllShows);
    const selectedShow = document.getElementById("select-show");
    selectedShow.style.removeProperty("display");
  });

  // Event listeners
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);
      const summaryMatch = episode.summary.toLowerCase().includes(searchTerm);
      return nameMatch || summaryMatch;
    });
    makePageForEpisodes(filteredEpisodes);
    updateEpisodeCount(filteredEpisodes.length, allEpisodes.length);
  });

  episodeSelect.addEventListener("change", () => {
    const selectedValue = episodeSelect.value;
    if (selectedValue === "") {
      makePageForEpisodes(allEpisodes);
      updateEpisodeCount(allEpisodes.length, allEpisodes.length);
    } else {
      const selectedEpisode = allEpisodes.filter(
        (episode) => episode.name === selectedValue
      );
      makePageForEpisodes(selectedEpisode);
      updateEpisodeCount(selectedEpisode.length, allEpisodes.length);
    }
  });
  //add button controls
  // Add elements to DOM
  const controlsDiv = document.createElement("div");
  controlsDiv.id = "controls";
  controlsDiv.append(searchInput, selectLabel, episodeSelect, button);
  rootElem.prepend(controlsDiv);

  // Episode count display
  const episodeCount = document.createElement("p");
  episodeCount.id = "episode-count";
  controlsDiv.append(episodeCount);
  updateEpisodeCount(allEpisodes.length, allEpisodes.length);
}

function updateEpisodeCount(filtered, total) {
  const episodeCount = document.getElementById("episode-count");
  episodeCount.textContent = `Displaying ${filtered} / ${total} episodes.`;
}

window.onload = setup;