// Properties
export const PAGE_QUERY = "page";
export const DEFAULT_PAGINATION_BAR_ID = "#pagination"


// Methods
export function getPageNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageNumber = Number(urlParams.get(PAGE_QUERY)) || 1;
    return Math.max(pageNumber, 1);
}

function changePageTo(pageNumber) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageNumber);
    window.location.href = url.toString();
}

export function assignPaginationBtns(currentIndex, totalIndices, paginationBarId = DEFAULT_PAGINATION_BAR_ID) {

    // Get pagination bar
    let paginationBar = document.querySelector(paginationBarId);
    paginationBar.style.display = "";  // Ensure pagination bar is visible


    // Get all elements in pagination bar
    let prevBtn = paginationBar.querySelector(".pagination-prev");
    let page1 = paginationBar.querySelector(".pagination-item:nth-of-type(2)"); // Intentionall not :nth-of-type(1) DO NOT CHANGE
    let startDots = paginationBar.querySelector(".pagination-dots:nth-of-type(1)");
    let page4 = paginationBar.querySelector(".pagination-item:nth-of-type(3)");
    let page5 = paginationBar.querySelector(".pagination-item:nth-of-type(4)");
    let pageActiveBtn = paginationBar.querySelector(".pagination-active");
    let page7 = paginationBar.querySelector(".pagination-item:nth-of-type(6)");
    let page8 = paginationBar.querySelector(".pagination-item:nth-of-type(7)");
    let endDots = paginationBar.querySelector(".pagination-dots:nth-of-type(2)");
    let page11 = paginationBar.querySelector(".pagination-item:nth-of-type(8)");
    let nextBtn = paginationBar.querySelector(".pagination-next");


    // Prev Button
    let toShowPrev = (currentIndex != 1);
    prevBtn.style.display = toShowPrev ? "" : "none"
    prevBtn.onclick = toShowPrev ? () => { changePageTo(currentIndex - 1) } : null;


    // Page 1 button
    let toShowPage1 = (4 <= currentIndex);
    page1.style.display = toShowPage1 ? "" : "none";
    page1.onclick = toShowPage1 ? () => { changePageTo(1) } : null;
    page1.textContent = toShowPage1 ? 1 : "-";


    // Start Dots 
    let toShowStartDots = (5 <= currentIndex);
    startDots.style.display = toShowStartDots ? "" : "none";


    // Page 4 button
    let toShowPage4 = (3 <= currentIndex);
    page4.style.display = toShowPage4 ? "" : "none";
    page4.onclick = toShowPage4 ? () => { changePageTo(currentIndex - 2) } : null;
    page4.textContent = toShowPage4 ? currentIndex - 2 : "-";


    // Page 5 button
    let toShowPage5 = (2 <= currentIndex);
    page5.style.display = toShowPage5 ? "" : "none";
    page5.onclick = toShowPage5 ? () => { changePageTo(currentIndex - 1) } : null;
    page5.textContent = toShowPage5 ? currentIndex - 1 : "-";


    // Active button
    pageActiveBtn.textContent = currentIndex;


    // Page 7 button
    let toShowPage7 = (totalIndices >= currentIndex + 1);
    page7.style.display = toShowPage7 ? "" : "none";
    page7.onclick = toShowPage7 ? () => { changePageTo(currentIndex + 1) } : null;
    page7.textContent = toShowPage7 ? currentIndex + 1 : "-";


    // Page 8 button
    let toShowPage8 = (totalIndices >= currentIndex + 2);
    page8.style.display = toShowPage8 ? "" : "none";
    page8.onclick = toShowPage8 ? () => { changePageTo(currentIndex + 2) } : null;
    page8.textContent = toShowPage8 ? currentIndex + 2 : "-";


    // Ending Dots
    let toShowEndDots = (currentIndex < totalIndices - 3);
    endDots.style.display = toShowEndDots ? "" : "none";


    // Page 11 button
    let toShowPage11 = (currentIndex < totalIndices - 2);
    page11.style.display = toShowPage11 ? "" : "none";
    page11.onclick = toShowPage11 ? () => { changePageTo(totalIndices) } : null;
    page11.textContent = toShowPage11 ? totalIndices : "-";


    // Next button
    let toShowNext = (currentIndex != totalIndices);
    nextBtn.style.display = toShowNext ? "" : "none";
    nextBtn.onclick = toShowNext ? () => { changePageTo(currentIndex + 1) } : null;
}