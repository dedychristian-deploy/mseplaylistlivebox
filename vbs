sub reset_active(boxType as Integer)

    dim c as Container = scene.findContainer("UPDATEBOX").getChildContainerByIndex(boxType)
    dim box_active as Container
    dim i as Integer

    for i = 0 to c.ChildContainerCount - 1
        box_active = c.GetChildContainerByIndex(i)
        box_active.Active = false
    next

    Scene.UpdateSceneTree()

end sub


sub set_index(boxType as Integer, boxName as String, targetIndex as Integer)

    dim box as Container
    dim c as Container = scene.findContainer("UPDATEBOX").getChildContainerByIndex(boxType)
    dim target as Container
    dim currentIndex as Integer

    box = c.FindSubContainer(boxName)

    if not box.Valid then
        exit sub
    end if

    box.Active = true

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
