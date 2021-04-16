import datetime
import shutil
import os
import errno


def merge_two_files(filenames, new_filename):
    with open(new_filename, "w") as write_file:
        for filename in filenames:
            with open(filename, "r") as read_file:
                write_file.write(read_file.read())
            write_file.write("\n")
    return True

def get_current_time():
    current_time = datetime.datetime.now().astimezone()
    current_time = current_time.strftime("%Y-%m-%dT%H:%M:%S%z")
    # Add a colon in utc offset
    current_time = "{0}:{1}".format(current_time[:-2],current_time[-2:])
    return current_time

def update_lastmod_time_in_hugo_header(header_file):
    current_lastmod = f"lastmod = {get_current_time()}\n"
    with open(header_file, "r") as read_file:
        lines = read_file.readlines()
        with open(header_file, "w") as write_file:
            for i, line in enumerate(lines):
                if i == 3:
                    write_file.write(current_lastmod)
                else:
                    write_file.write(line)

def generate_hugo_index_file(hugo_header_file, index_file, new_file):
    update_lastmod_time_in_hugo_header(hugo_header_file)
    return merge_two_files([hugo_header_file, index_file], new_file)

def copy_file_or_directory(source_path, destination_path):
    try:
        new_directory = os.path.join(destination_path, source_path)
        shutil.copytree(source_path, new_directory)
    except OSError as err:
        if err.errno == errno.ENOTDIR:
            shutil.copy2(source_path, destination_path)

def generate_hugo_directory(directory_name):
    shutil.rmtree(directory_name, ignore_errors=True)
    os.mkdir(directory_name)
    source_paths = ["js", "css", "images", "screenshots",
                 "README.md"]
    for source in source_paths:
        copy_file_or_directory(source, directory_name)

if __name__ == "__main__":
    hugo_utils_directory = "hugo_utils"
    hugo_header_file_name = "hugo_header.txt"
    hugo_header = os.path.join(hugo_utils_directory, hugo_header_file_name)
    index_file_name = "index.html"
    hugo_directory = "c19"
    new_file_name = os.path.join(hugo_directory, index_file_name)
    generate_hugo_directory(hugo_directory)
    generate_hugo_index_file(hugo_header,
                             index_file_name, new_file_name)


    
