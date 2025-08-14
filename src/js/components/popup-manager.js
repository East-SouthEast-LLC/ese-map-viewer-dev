// src/js/components/popup-manager.js

/**
 * generates the html content for a map popup based on the properties of a clicked map feature.
 * @param {object} feature - the mapbox feature object that was clicked.
 * @returns {string} the html string for the popup.
 */
function generatePopupHTML(feature) {
    const props = feature.properties;
    let popupHTML = '';

    switch (feature.layer.id) {
        case 'parcels':
            popupHTML = `Address: <strong>${props.ADDRESS}</strong><br>Webpage: <a href="${props.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
            break;
        case 'floodplain':
            popupHTML = `Flood Zone: <strong>${props.FLD_ZONE}</strong><br>Elevation: <strong>${props.STATIC_BFE}</strong>`;
            break;
        case 'DEP wetland':
            popupHTML = `Wetland Identifier: <strong>${props.IT_VALDESC}</strong><br>Wetland Code: <strong>${props.IT_VALC}</strong>`;
            break;
        case 'zoning':
            popupHTML = `Zoning District: <strong>${props.TOWNCODE}</strong><br><br>Check with the Town Clerk or Planning Department.<br><strong>This layer is from 2004</strong>`;
            break;
        case 'sewer':
            popupHTML = `Approximate year constructed: ${props.CONTRACT}<br>Address: <strong>${props.ADDRESS}</strong><br>Webpage: <a href="${props.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
            break;
        case 'sewer plans':
            if (props.CONSERV === 'Y') {
                popupHTML = "Conservation Property<br>Disclaimer: Information may be inaccurate.";
            } else {
                popupHTML = `Year of plan: <strong>${props.DATE || 'N/A'}</strong><br>Plan ID: <strong>${props.SHEET || 'N/A'}</strong><br>`;
                if (props.ADDED === 'Y') {
                    popupHTML += `Website: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to page</u></b></a>` : 'N/A'}<br>On sewer but not included in original plans<br>`;
                } else {
                    popupHTML += `Link to plan: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to plan</u></b></a>` : 'N/A'}<br>`;
                }
                popupHTML += "Disclaimer: Information may be inaccurate.";
            }
            break;
        case 'acec':
            popupHTML = `Area of Critical Environmental Concern: <strong>${props.NAME}</strong><br>DEP ACEC Designation: <a href="${props.LINK}" target="_blank"><b><u>Link to Document</u></b></a>`;
            break;
        case 'agis':
            popupHTML = `Address <strong>${props.ADDRESS}</strong><br>Date of photography: <strong>${props.DATE}</strong><br>Link to Page: <a href="${props.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
            break;
        case 'conservancy districts':
            popupHTML = `Conservancy District: <strong>${props.CONS_DIST}</strong><br><br>${props.CONS_DIST} Elevation: <strong>${props.CONS_ELEV} ${props.CONS_DATUM}</strong><br>${props.CONS_DIST} Water Elevation: <strong>${props.WATER_ELEV} ${props.CONS_DATUM}</strong><br><br>Conservancy District Contour: <strong>${props.CONT_NAVD} ${props.CONV_DATUM}</strong><br><br>Description: ${props.CONS_DESC}`;
            break;
        case 'conservation':
            popupHTML = `CCF Parcel: <strong>${props.CCF_ID}</strong><br><br>The light green parcels are approximate, the dark green parcels are more accurate.`;
            break;
        case 'endangered species':
            popupHTML = `Estimated Habitat ID: <strong>${props.ESTHAB_ID}</strong><br>Priority Habitat ID: <strong>${props.PRIHAB_ID}</strong>`;
            break;
        case 'vernal pools': 
            popupHTML = `Vernal Pool ID: <strong>${props.cvp_num}</strong><br>Certified: <strong>${props.certified}</strong><br>Criteria: <strong>${props.criteria}</strong>`;
            break;
        case 'historic':
            popupHTML = `Historic District: ${props.District}<br>Status / Reference: <strong>${props.Status}</strong><br>Documentation: <a href="${props.URL}" target="_blank"><b><u>Link to Document</u></b></a>`;
            break;
        case 'intersection':
            popupHTML = `Intersection: <strong>${props.Int_Name}</strong><br>Webpage: <a href="${props.Link}" target="_blank"><b><u>Link to Page</u></b></a>`;
            break;
        case 'stories':
            popupHTML = `Number of Stories: <strong>${props.STORIES}</strong><br>Building Description: <strong>${props.BLD_DESC}</strong><br>Zoning: <strong>${props.ZONING}</strong>`;
            break;
        case 'zone II':
            popupHTML = `Zone II number: <strong>${props.ZII_NUM}</strong><br>Water Supplier: <strong>${props.SUPPLIER}</strong><br>Town: <strong>${props.TOWN}</strong>`;
            break;
        case 'soils':
            popupHTML = `Numeric State Legend: <strong>${props.MUSYM}</strong><br>Published Map Unit: <strong>${props.MUS_TXT}</strong><br><strong>${props.MUS_DESC}</strong>`;
            break;
    }

    return popupHTML;
}