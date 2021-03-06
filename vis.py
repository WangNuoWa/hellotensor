import matplotlib.pyplot as plt
import cv2
import math
import numpy as np

def show(img):
    plt.imshow(img,cmap='gray')
    plt.show(block=False)

def getimage(index):
    xi = ximages[index]
    i = np.reshape(xi,(xi.shape[0],xi.shape[1]))
    return i

def showindex(index):
    show(getimage(index))

def showmatrix(m,w,h):
    fig0,plots = plt.subplots(h,w,subplot_kw={'xticks': [], 'yticks': []})
    fig0.subplots_adjust(hspace=0.01, wspace=0.01)
    index = 0
    for line in plots:
        for i in line:
            if index >= len(m):
                break
            i.imshow(m[index],cmap='gray')
            index+=1
    plt.show(block=False)

def weightshow(m):
    # m(w,h,d,count)

    #show a matrice of images
    count = m.shape[3]
    plt.figure()
    fig0, plots = plt.subplots(count,subplot_kw={'xticks': [], 'yticks': []})
    fig0.subplots_adjust(hspace=0.1, wspace=0.01)
    for i in range(count):
        img = np.reshape(m[:,:,:,i],(m.shape[0],m.shape[1]))
        plots[i].imshow(img,cmap='gray')
    plt.show(block=False)


def autoscaler(img,limit=400.):
    # scales = [0.1,0.125,1./6.,0.2,0.25,1./3.,1./2.] + range(100)
    scales = np.hstack([1./np.linspace(10,2,num=9), np.linspace(1,100,num=100)])

    imgscale = limit/float(max(img.shape[0],img.shape[1]))
    for s in reversed(scales):
        if s<=imgscale:
            imgscale=s
            break

    if imgscale!=1.:
        img = cv2.resize(img,dsize=(int(img.shape[1]*imgscale),int(img.shape[0]*imgscale)),interpolation=cv2.INTER_NEAREST)

    return img,imgscale

def autoscaler_show(img,limit=800.):
    im,ims = autoscaler(img,limit=limit)
    cv2.imshow(str(img.shape)+' gened scale:'+str(ims),im)
    cv2.waitKey(1)

def batch_image_array(arr):
    import cv2
    num,uh,uw,depth = arr.shape

    patches = num
    height = max(1,int(math.sqrt(patches)*0.9))
    width = int(patches/height+1)

    img = np.zeros((height*(uh+1), width*(uw+1), 3),dtype='float32')

    index = 0
    for row in range(height):
        for col in range(width):
            if index<num:
                channels = arr[index]
                img[row*(uh+1):row*(uh+1)+uh,col*(uw+1):col*(uw+1)+uw,:] = channels
            index+=1

    img,imgscale = autoscaler(img)

    return img,imgscale
