#!/usr/bin/python
import os
from flask import Flask, render_template, send_from_directory, request



class dirmanager:

  def __init__(self,programdir):
    self.programdir = programdir
    self.subjectParentDir = programdir
    self.subjects = []
    self.getSubjectList()


  def isSubject(self,prospect):
    if not os.path.isdir(prospect):
      return False
    subdirlist = os.listdir(prospect)
    foundmeshes = 0
    for mfile in subdirlist:
      if 'resliced_mesh' in mfile:
        foundmeshes += 1
    if foundmeshes == 14:
      return True
    return False

  def setsubjectParentDir(self,path):
    if not os.path.isdir(path):
      return False
    newsubjects = []
    dirlist = os.listdir(path) 
    for prospect in dirlist:
      if self.isSubject(path +'/'+ prospect):
        newsubjects.append(prospect)
    if len(newsubjects) > 0:
      self.subjectParentDir = path
      return True
    return False

  def getSubjectList(self):
    slist = '['
    for subject in os.listdir(str(self.subjectParentDir)):
      if self.isSubject(self.subjectParentDir +'/'+ subject):
        slist += '"' + subject + '",'
        self.subjects.append(subject)
    slist = slist[:-1] + ']'
    print slist
    return slist

  def getCurrentSubject(self,index):
    return self.subjectParentDir +'/'+ self.subjects[int(index)] +'/'


dirmanager = dirmanager(os.getcwd())











app = Flask(__name__)  

@app.route('/')
def home():
  return send_from_directory(dirmanager.programdir,'served.html')

#@app.route('/mesh/<path:path>')
#def mesh(path):
#  subjectidx = int(request.args.get('subjectidx'))
#  return send_from_directory(dirmanager.getCurrentSubject(subjectidx), path)

@app.route('/mesh/<subject>/<path>')
def mesh(subject,path):
  if 'resliced_mesh' not in path:
    return 'permission denied'
  print subject, path
  return send_from_directory(dirmanager.getCurrentSubject(subject), path)

@app.route('/subjects')
def subjects():
  return dirmanager.getSubjectList()

@app.route('/scripts/<path>')
def scripts(path):
  if path in ['main.js','math.js']:
    return send_from_directory(dirmanager.programdir,path)
  else:
    return 'permission denied'

@app.route('/change',methods=['POST'])
def change():
  newpath = request.form.get('finder')
  if dirmanager.setsubjectParentDir(newpath):
    response = 'Directory changed to ' + newpath
  else:
    response = newpath + ' is not a directory with enigma data.'
  print response
  return response

if __name__ == '__main__':
    app.run(debug=False)
