from sentinelsat import SentinelAPI
from datetime import datetime
from landsatxplore.api import API
from landsatxplore.earthexplorer import EarthExplorer
import rasterio
import fiona
import numpy as np
import rasterio.mask
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import eoreader.reader as reader
import eoreader.bands as bands
import matplotlib.pyplot as plt
import os
import tarfile

def downloadSentinel2Products(username, password, start_date, end_date):

    api = SentinelAPI(username, password, 'https://scihub.copernicus.eu/dhus')

    footprint = "POLYGON((78.2619920340943 17.346358102914422,78.32891956919447 17.346358102914422,78.32891956919447 17.40256710054625,78.2619920340943 17.40256710054625,78.2619920340943 17.346358102914422))"
    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    product_type = 'S2MSI2A'

    ## Search for available products
    products = api.query(footprint,
                         date=(start_date, end_date),
                         platformname='Sentinel-2',
                         producttype=product_type
                         )

    # Download products
    for product_id in products:
        if 'T44QKE' in products[product_id]['title']:
            api.download(product_id, '.')
        #api.download(product_id, '.')
    
def downloadSentinel3Products(username, password, start_date, end_date):

    api = SentinelAPI(username, password, 'https://scihub.copernicus.eu/dhus')

    footprint = "POLYGON((78.2619920340943 17.346358102914422,78.32891956919447 17.346358102914422,78.32891956919447 17.40256710054625,78.2619920340943 17.40256710054625,78.2619920340943 17.346358102914422))"
    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    product_type = 'OL_1_EFR___'

    ## Search for available products
    products = api.query(footprint,
                         date=(start_date, end_date),
                         platformname='Sentinel-3',
                         producttype=product_type
                         )

    # Download products
    for product_id in products:
        api.download(product_id, '.')

def downloadLandSatProducts(username, password, start_date, end_date):
    # try if logged in to ee api
    try:
        ee = EarthExplorer(username, password)
        #ee.logout()
    except:
        pass

    api = API(username, password)
    #ee = EarthExplorer(username, password)

    scenes = api.search(
    dataset='landsat_ot_c2_l2',
    latitude=17.48,
    longitude=78.3,
    start_date=start_date,
    end_date=end_date,
    max_cloud_cover=60
    )

    print(f"{len(scenes)} scenes found.")

    # Download the scenes
    for scene in scenes:
        fname = scene['display_id']
        ee.download(fname, output_dir='.')

    #api.logout()
    #ee.logout()

def generateSentinel2TIFF(product_path, resoultion = 60.):
    prod = reader.Reader().open(product_path)
    print(prod)
    ok_bands = ['COASTAL_AEROSOL','GREEN','RED','VEGETATION_RED_EDGE_1','NIR','WATER_VAPOUR','SWIR_1','SWIR_2']
    stack = prod.stack(
        ok_bands,
        resolution=resoultion,
        stack_path="stack_sentinel2.tif"
    )

def generateSentinel3TIFF(product_path, resoultion = 200.):
    prod = reader.Reader().open(product_path)
    print(prod)
    ok_bands = ['BLUE','GREEN','RED'] # Oa04, Oa06, Oa08 
    stack = prod.stack(
        ok_bands,
        resolution=resoultion,
        stack_path="stack_sentinel3.tif"
    )

def generateLandSatTIFF(product_path):
    
    tar_file = tarfile.open(product_path)
    tar_file.extract(product_path[:-4]+"_ST_B10.TIF")
    tar_file.close()

    # delete stack_landsat.tif if it exists
    if os.path.exists("stack_landsat.tif"):
        os.remove("stack_landsat.tif")
    # rename file
    os.rename(product_path[:-4]+"_ST_B10.TIF", "stack_landsat.tif")

def clipRegion(tif_path, aoi_path, dest_path):

    aoiFile = fiona.open(aoi_path, 'r')
    aoiGeom = [aoiFile[0]['geometry']]

    # apply polygon geometry to extract the raster
    with rasterio.open(tif_path) as src:
        out_image, out_transform = rasterio.mask.mask(src, aoiGeom, crop=True)
        out_meta = src.meta
    
    # save the resulting raster
    out_meta.update({"driver": "GTiff",
                        "height": out_image.shape[1],
                        "width": out_image.shape[2],
                        "transform": out_transform})
    
    with rasterio.open(dest_path, "w", **out_meta) as dest:
        dest.write(out_image)

def reduceToSingleValue(raster, vmin, vmax):
    raster[raster > vmax] = np.nan
    raster[raster < vmin] = np.nan
    return np.nanmean(raster)

def processSentinel2TIFF(tif_path):

    # read the raster
    with rasterio.open(tif_path) as src:
        out_image = src.read(masked=True)
        out_meta = src.meta
    
    NO_DATA_VALUE = src.nodata

    # separate the bands
    COASTAL_AEROSOL = out_image[0]
    GREEN = out_image[1]
    RED = out_image[2]
    RED_EDGE1 = out_image[3]
    NIR = out_image[4]
    WATER_VAPOUR = out_image[5]
    SWIR1 = out_image[6]
    SWIR2 = out_image[7]

    # convert rasters to numpy arrays
    COASTAL_AEROSOL = np.array(COASTAL_AEROSOL)
    GREEN = np.array(GREEN)
    RED = np.array(RED)
    RED_EDGE1 = np.array(RED_EDGE1)
    NIR = np.array(NIR)
    WATER_VAPOUR = np.array(WATER_VAPOUR)
    SWIR1 = np.array(SWIR1)
    SWIR2 = np.array(SWIR2)

    # replace no data values with NaN
    COASTAL_AEROSOL[COASTAL_AEROSOL == NO_DATA_VALUE] = np.nan
    GREEN[GREEN == NO_DATA_VALUE] = np.nan
    RED[RED == NO_DATA_VALUE] = np.nan
    RED_EDGE1[RED_EDGE1 == NO_DATA_VALUE] = np.nan
    NIR[NIR == NO_DATA_VALUE] = np.nan
    WATER_VAPOUR[WATER_VAPOUR == NO_DATA_VALUE] = np.nan
    SWIR1[SWIR1 == NO_DATA_VALUE] = np.nan
    SWIR2[SWIR2 == NO_DATA_VALUE] = np.nan

    ndci = (RED_EDGE1-RED)/(RED_EDGE1+RED)
    ndwi = (GREEN-RED_EDGE1)/(GREEN+RED_EDGE1)
    ndsi = (SWIR1-SWIR2)/(SWIR1+SWIR2)
    ndti = (RED-GREEN)/(RED+GREEN)
    ph = 8.339-0.827*(COASTAL_AEROSOL/NIR)
    do = 9.577-0.0167*NIR+0.0067*WATER_VAPOUR+0.0083*SWIR1

    # reduce the raster to a single value for each raster
    ndci_mean = reduceToSingleValue(ndci, -1, 1)
    ndwi_mean = reduceToSingleValue(ndwi, -1, 1)
    ndsi_mean = reduceToSingleValue(ndsi, -1, 1)
    ndti_mean = reduceToSingleValue(ndti, -1, 1)
    ph_mean = reduceToSingleValue(ph, 0, 14)
    do_mean = reduceToSingleValue(do, -200, 200)

    # plot the numpy arrays in subplots and put title to each subplot as mean value
    fig, axs = plt.subplots(2, 3, figsize=(8, 4))
    axs[0, 0].imshow(ndci)
    axs[0, 0].set_title("NDCI: "+str(ndci_mean))
  
    axs[0, 1].imshow(ndwi)
    axs[0, 1].set_title("NDWI: "+str(ndwi_mean))

    axs[0, 2].imshow(ndsi)
    axs[0, 2].set_title("NDSI: "+str(ndsi_mean))

    axs[1, 0].imshow(ndti)
    axs[1, 0].set_title("NDTI: "+str(ndti_mean))
 
    axs[1, 1].imshow(ph)
    axs[1, 1].set_title("PH: "+str(ph_mean))

    axs[1, 2].imshow(do)
    axs[1, 2].set_title("DO: "+str(do_mean))

    plt.tight_layout()
    # set axis off
    for ax in axs.flat:
        ax.set_axis_off()
    plt.show()

    # return the mean values and the numpy arrays
    return ndci_mean, ndwi_mean, ndsi_mean, ndti_mean, ph_mean, do_mean, ndci, ndwi, ndsi, ndti, ph, do

def processSentinel3TIFF(tif_path):

    # read the raster
    with rasterio.open(tif_path) as src:
        out_image = src.read(masked=True)
        out_meta = src.meta
    
    NO_DATA_VALUE = src.nodata

    BLUE = out_image[0]
    GREEN = out_image[1]
    RED = out_image[2]

    BLUE = np.array(BLUE)
    GREEN = np.array(GREEN)
    RED = np.array(RED)

    BLUE[BLUE == NO_DATA_VALUE] = np.nan
    GREEN[GREEN == NO_DATA_VALUE] = np.nan
    RED[RED == NO_DATA_VALUE] = np.nan

    SuspendedMatter = RED/GREEN
    DissolvedOrganicMatter = RED/BLUE

    SuspendedMatter_mean = reduceToSingleValue(SuspendedMatter, -1, 1)
    DissolvedOrganicMatter_mean = reduceToSingleValue(DissolvedOrganicMatter, -1, 1)

    # plot the numpy arrays in subplots and put title to each subplot as mean value with colorbar
    fig, axs = plt.subplots(1, 2, figsize=(6, 3))
    axs[0].imshow(SuspendedMatter)
    axs[0].set_title("Suspended Matter: "+str(SuspendedMatter_mean))

    axs[1].imshow(DissolvedOrganicMatter)
    axs[1].set_title("Dissolved Organic Matter: "+str(DissolvedOrganicMatter_mean))

    plt.tight_layout()
    # set axis off
    for ax in axs.flat:
        ax.set_axis_off()
    plt.show()

    # return the mean values and the numpy arrays
    return SuspendedMatter_mean, DissolvedOrganicMatter_mean, SuspendedMatter, DissolvedOrganicMatter

def processLandSatTIFF(tif_path):

    # read the raster
    with rasterio.open(tif_path) as src:
        out_image = src.read(masked=True)
        out_meta = src.meta
    
    NO_DATA_VALUE = src.nodata

    TIR_1 = out_image[0]
    TIR_1 = np.array(TIR_1)

    surface_temp = TIR_1*0.00341802+149-273.15
    surface_temp_mean = reduceToSingleValue(surface_temp, -100, 100)

    # plot the numpy arrays in subplots and put title to each subplot as mean value
    fig, axs = plt.subplots(1, 1, figsize=(8, 3))
    axs.imshow(surface_temp)
    axs.set_title("Surface Temperature: "+str(surface_temp_mean))
    # show colorbar
    cbar = plt.colorbar(axs.imshow(surface_temp))
    cbar.ax.set_ylabel('Surface Temperature (°C)', rotation=270, labelpad=15)

    plt.tight_layout()
    axs.set_axis_off()
        
    # return the mean values and the numpy arrays
    return surface_temp_mean, surface_temp