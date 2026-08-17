
sub set_index(boxType as integer, boxName as String, targetIndex as Integer)
'sub set_index(boxType as String, boxName as String, targetIndex as Integer)

    dim box as Container
    dim c as container = scene.findContainer("UPDATEBOX").getChildContainerByIndex(boxType)
    'dim c as container = scene.findContainer(boxType)
    dim target as Container
    dim currentIndex as Integer

    box = c.FindSubContainer(boxName)

    if not box.Valid then
        exit sub
    end if

    currentIndex = box.GetLocalIndex()

    if currentIndex = targetIndex then
        exit sub
    end if

    target = c.GetChildContainerByIndex(targetIndex)

    if currentIndex > targetIndex then
        box.MoveTo(target, TL_PREVIOUS)
    else
        box.MoveTo(target, TL_NEXT)
    end if
    
    Scene.UpdateSceneTree()

end sub
sub OnInitParameters()
registerPushButton("push","push",0)
end sub


sub OnExecAction(buttonId As Integer)
set_index(0,"BOX_01",3)
this.Update()
end sub
