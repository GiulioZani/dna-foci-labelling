from tifffile import imread
import cv2 as cv
import os
import ipdb

def main(src: str, dist: str):
    if not os.path.exists(dist):
        print('creating output directory')
        os.mkdir(dist)
    file_names = [file_name for file_name in os.listdir(src)]
    for file_name in file_names:
        if file_name.endswith('.TIF'):
            print(file_name)
            img = imread(os.path.join(src, file_name))
            dest_file_name = os.path.join(dist, file_name[:-3] + "png")
            print(f"{dest_file_name=}")
            cv.imwrite(dest_file_name, img)
        # img = cv.imread(dest_file_name, cv.IMREAD_UNCHANGED)
        # ipdb.set_trace()


if __name__ == "__main__":
    #parser = ArgumentParser()
    #parser.add_argument("src", help="source directory")
    #parser.add_argument("dist", help="destination directory")
    #args = parser.parse_args()
    #main(args.src, args.dist)
    source = "C:\\Users\\hp\\Desktop\\TESI TRIENNALE\\immagini1gy24hNOBPA"
    destination = "C:\\Users\\hp\\Desktop\\TESI TRIENNALE\\immagini1gy24hNOBPA"
    main(source, destination)
